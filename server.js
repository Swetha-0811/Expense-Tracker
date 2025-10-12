const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const dbPath = path.join(__dirname, 'database', 'expense.db');

// Create database directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'database'))) {
    fs.mkdirSync(path.join(__dirname, 'database'));
    console.log('Database directory created');
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Personal expenses table
        db.run(`
            CREATE TABLE IF NOT EXISTS personal_expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('Error creating personal_expenses table:', err.message);
        });
        
        // Personal monthly budgets table
        db.run(`
            CREATE TABLE IF NOT EXISTS personal_budgets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                amount REAL NOT NULL,
                month TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(category, month)
            )
        `, (err) => {
            if (err) console.error('Error creating personal_budgets table:', err.message);
        });
        
        // Roommates table
        db.run(`
            CREATE TABLE IF NOT EXISTS roommates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('Error creating roommates table:', err.message);
        });
        
        // Shared expenses table
        db.run(`
            CREATE TABLE IF NOT EXISTS shared_expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                paid_by INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paid_by) REFERENCES roommates(id)
            )
        `, (err) => {
            if (err) console.error('Error creating shared_expenses table:', err.message);
        });
        
        // Expense shares table
        db.run(`
            CREATE TABLE IF NOT EXISTS expense_shares (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                expense_id INTEGER NOT NULL,
                roommate_id INTEGER NOT NULL,
                share_amount REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (expense_id) REFERENCES shared_expenses(id),
                FOREIGN KEY (roommate_id) REFERENCES roommates(id),
                UNIQUE(expense_id, roommate_id)
            )
        `, (err) => {
            if (err) console.error('Error creating expense_shares table:', err.message);
        });
        
        // Shared monthly budgets table
        db.run(`
            CREATE TABLE IF NOT EXISTS shared_budgets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                amount REAL NOT NULL,
                month TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(category, month)
            )
        `, (err) => {
            if (err) console.error('Error creating shared_budgets table:', err.message);
        });
        
        // Notifications table
        db.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message TEXT NOT NULL,
                roommate_id INTEGER NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (roommate_id) REFERENCES roommates(id)
            )
        `, (err) => {
            if (err) console.error('Error creating notifications table:', err.message);
        });
        
        console.log('Database tables initialized');
    });
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files for personal expenses
app.use('/personal', express.static(path.join(__dirname, '../personal-expenses')));

// Serve static files for shared expenses
app.use('/shared', express.static(path.join(__dirname, '../shared-expenses')));

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Personal Expenses API

// Get all personal expenses
app.get('/api/personal/expenses', (req, res) => {
    db.all('SELECT * FROM personal_expenses ORDER BY date DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching personal expenses:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add a new personal expense
app.post('/api/personal/expenses', (req, res) => {
    const { amount, category, description, date } = req.body;
    
    if (!amount || !category || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    db.run(
        'INSERT INTO personal_expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
        [amount, category, description, date],
        function(err) {
            if (err) {
                console.error('Error adding personal expense:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Get all personal budgets
app.get('/api/personal/budgets', (req, res) => {
    db.all('SELECT * FROM personal_budgets ORDER BY month DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching personal budgets:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add or update a personal budget
app.post('/api/personal/budgets', (req, res) => {
    const { category, amount, month } = req.body;
    
    if (!category || !amount || !month) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if budget for this category and month already exists
    db.get(
        'SELECT * FROM personal_budgets WHERE category = ? AND month = ?',
        [category, month],
        (err, row) => {
            if (err) {
                console.error('Error checking existing personal budget:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (row) {
                // Update existing budget
                db.run(
                    'UPDATE personal_budgets SET amount = ? WHERE id = ?',
                    [amount, row.id],
                    function(err) {
                        if (err) {
                            console.error('Error updating personal budget:', err.message);
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ id: row.id, updated: true });
                    }
                );
            } else {
                // Insert new budget
                db.run(
                    'INSERT INTO personal_budgets (category, amount, month) VALUES (?, ?, ?)',
                    [category, amount, month],
                    function(err) {
                        if (err) {
                            console.error('Error adding personal budget:', err.message);
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ id: this.lastID });
                    }
                );
            }
        }
    );
});

// Get personal analytics data
app.get('/api/personal/analytics', (req, res) => {
    // Get expenses by category
    db.all(
        'SELECT category, SUM(amount) as total FROM personal_expenses GROUP BY category',
        (err, expenseRows) => {
            if (err) {
                console.error('Error fetching personal expense analytics:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Get budgets by category for current month
            const currentMonth = new Date().toISOString().slice(0, 7);
            db.all(
                'SELECT category, amount FROM personal_budgets WHERE month = ?',
                [currentMonth],
                (err, budgetRows) => {
                    if (err) {
                        console.error('Error fetching personal budget analytics:', err.message);
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    // Calculate totals
                    const totalExpenses = expenseRows.reduce((sum, item) => sum + item.total, 0);
                    const totalBudget = budgetRows.reduce((sum, item) => sum + item.amount, 0);
                    const remainingBudget = totalBudget - totalExpenses;
                    
                    res.json({
                        expensesByCategory: expenseRows,
                        budgetsByCategory: budgetRows,
                        totalExpenses,
                        totalBudget,
                        remainingBudget
                    });
                }
            );
        }
    );
});

// Shared Expenses API

// Get all roommates
app.get('/api/shared/roommates', (req, res) => {
    db.all('SELECT * FROM roommates ORDER BY name', (err, rows) => {
        if (err) {
            console.error('Error fetching roommates:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add a new roommate
app.post('/api/shared/roommates', (req, res) => {
    const { name, email } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    
    db.run(
        'INSERT INTO roommates (name, email) VALUES (?, ?)',
        [name, email || null],
        function(err) {
            if (err) {
                console.error('Error adding roommate:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Update a roommate
app.put('/api/shared/roommates/:id', (req, res) => {
    const id = req.params.id;
    const { name, email } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    
    db.run(
        'UPDATE roommates SET name = ?, email = ? WHERE id = ?',
        [name, email || null, id],
        function(err) {
            if (err) {
                console.error('Error updating roommate:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Roommate not found' });
            }
            res.json({ success: true });
        }
    );
});

// Delete a roommate
app.delete('/api/shared/roommates/:id', (req, res) => {
    const id = req.params.id;
    
    // Check if roommate has any shared expenses
    db.get('SELECT COUNT(*) as count FROM shared_expenses WHERE paid_by = ?', [id], (err, row) => {
        if (err) {
            console.error('Error checking roommate expenses:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (row.count > 0) {
            return res.status(400).json({ error: 'Cannot delete roommate with existing expenses' });
        }
        
        // Delete the roommate
        db.run('DELETE FROM roommates WHERE id = ?', [id], function(err) {
            if (err) {
                console.error('Error deleting roommate:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Roommate not found' });
            }
            res.json({ success: true });
        });
    });
});

// Get all shared expenses
app.get('/api/shared/expenses', (req, res) => {
    db.all(`
        SELECT se.*, r.name as paid_by_name 
        FROM shared_expenses se
        JOIN roommates r ON se.paid_by = r.id
        ORDER BY se.date DESC
    `, (err, rows) => {
        if (err) {
            console.error('Error fetching shared expenses:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add a new shared expense
app.post('/api/shared/expenses', (req, res) => {
    const { amount, description, date, paid_by, shares } = req.body;
    
    if (!amount || !date || paid_by === undefined || !shares || shares.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Start a transaction
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Insert the shared expense
        db.run(
            'INSERT INTO shared_expenses (amount, description, date, paid_by) VALUES (?, ?, ?, ?)',
            [amount, description, date, paid_by],
            function(err) {
                if (err) {
                    console.error('Error adding shared expense:', err.message);
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }
                
                const expenseId = this.lastID;
                let completedShares = 0;
                
                // Insert each share
                shares.forEach(share => {
                    db.run(
                        'INSERT INTO expense_shares (expense_id, roommate_id, share_amount) VALUES (?, ?, ?)',
                        [expenseId, share.roommate_id, share.amount],
                        function(err) {
                            if (err) {
                                console.error('Error adding expense share:', err.message);
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: err.message });
                            }
                            
                            completedShares++;
                            
                            // If all shares are inserted, commit the transaction
                            if (completedShares === shares.length) {
                                db.run('COMMIT');
                                
                                // Create notifications for all roommates except the one who paid
                                db.all('SELECT id FROM roommates WHERE id != ?', [paid_by], (err, roommates) => {
                                    if (err) {
                                        console.error('Error fetching roommates for notifications:', err.message);
                                        return;
                                    }
                                    
                                    const notificationMessage = `New shared expense: ${description || 'Shared expense'} of ₹${amount}`;
                                    
                                    roommates.forEach(roommate => {
                                        db.run(
                                            'INSERT INTO notifications (message, roommate_id) VALUES (?, ?)',
                                            [notificationMessage, roommate.id]
                                        );
                                    });
                                });
                                
                                res.json({ id: expenseId });
                            }
                        }
                    );
                });
            }
        );
    });
});

// Get expense shares for a specific expense
app.get('/api/shared/expense-shares/:expenseId', (req, res) => {
    const expenseId = req.params.expenseId;
    
    db.all(`
        SELECT es.*, r.name as roommate_name 
        FROM expense_shares es
        JOIN roommates r ON es.roommate_id = r.id
        WHERE es.expense_id = ?
    `, [expenseId], (err, rows) => {
        if (err) {
            console.error('Error fetching expense shares:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get all shared budgets
app.get('/api/shared/budgets', (req, res) => {
    db.all('SELECT * FROM shared_budgets ORDER BY month DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching shared budgets:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add or update a shared budget
app.post('/api/shared/budgets', (req, res) => {
    const { category, amount, month } = req.body;
    
    if (!category || !amount || !month) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if budget for this category and month already exists
    db.get(
        'SELECT * FROM shared_budgets WHERE category = ? AND month = ?',
        [category, month],
        (err, row) => {
            if (err) {
                console.error('Error checking existing shared budget:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (row) {
                // Update existing budget
                db.run(
                    'UPDATE shared_budgets SET amount = ? WHERE id = ?',
                    [amount, row.id],
                    function(err) {
                        if (err) {
                            console.error('Error updating shared budget:', err.message);
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ id: row.id, updated: true });
                    }
                );
            } else {
                // Insert new budget
                db.run(
                    'INSERT INTO shared_budgets (category, amount, month) VALUES (?, ?, ?)',
                    [category, amount, month],
                    function(err) {
                        if (err) {
                            console.error('Error adding shared budget:', err.message);
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ id: this.lastID });
                    }
                );
            }
        }
    );
});

// Get balances for all roommates
app.get('/api/shared/balances', (req, res) => {
    // Get all roommates
    db.all('SELECT * FROM roommates', (err, roommates) => {
        if (err) {
            console.error('Error fetching roommates for balances:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        
        const balances = {};
        
        // Initialize balances
        roommates.forEach(roommate => {
            balances[roommate.id] = {
                id: roommate.id,
                name: roommate.name,
                balance: 0
            };
        });
        
        // Calculate how much each person has paid for others
        db.all(`
            SELECT se.paid_by, es.roommate_id, es.share_amount
            FROM shared_expenses se
            JOIN expense_shares es ON se.id = es.expense_id
            WHERE se.paid_by != es.roommate_id
        `, (err, rows) => {
            if (err) {
                console.error('Error calculating balances:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Update balances
            rows.forEach(row => {
                balances[row.paid_by].balance += row.share_amount;
                balances[row.roommate_id].balance -= row.share_amount;
            });
            
            // Calculate settlements
            const debtors = Object.values(balances).filter(b => b.balance < 0);
            const creditors = Object.values(balances).filter(b => b.balance > 0);
            
            const settlementList = [];
            
            debtors.forEach(debtor => {
                creditors.forEach(creditor => {
                    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
                    if (amount > 0.01) { // Only add if amount is significant
                        settlementList.push({
                            from: debtor.id,
                            fromName: debtor.name,
                            to: creditor.id,
                            toName: creditor.name,
                            amount: amount
                        });
                        
                        // Update balances
                        debtor.balance += amount;
                        creditor.balance -= amount;
                    }
                });
            });
            
            res.json({
                balances: Object.values(balances),
                settlements: settlementList
            });
        });
    });
});

// Get notifications for a roommate
app.get('/api/shared/notifications/:roommateId', (req, res) => {
    const roommateId = req.params.roommateId;
    
    db.all(`
        SELECT * FROM notifications 
        WHERE roommate_id = ? 
        ORDER BY created_at DESC
    `, [roommateId], (err, rows) => {
        if (err) {
            console.error('Error fetching notifications:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Mark notification as read
app.post('/api/shared/notifications/:notificationId/read', (req, res) => {
    const notificationId = req.params.notificationId;
    
    db.run(
        'UPDATE notifications SET is_read = 1 WHERE id = ?',
        [notificationId],
        function(err) {
            if (err) {
                console.error('Error marking notification as read:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        }
    );
});

// Serve the main page (redirect to personal expenses)
app.get('/', (req, res) => {
    res.redirect('/personal');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Personal expenses: http://localhost:${PORT}/personal`);
    console.log(`Shared expenses: http://localhost:${PORT}/shared`);
});