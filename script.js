document.addEventListener('DOMContentLoaded', function() {
    // Set current date as default
    document.getElementById('shared-date').valueAsDate = new Date();
    
    // Set current month as default
    const now = new Date();
    document.getElementById('shared-budget-month').value = now.toISOString().slice(0, 7);
    
    // Load roommates
    loadRoommates();
    
    // Add roommate form submission
    document.getElementById('add-roommate-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const roommate = {
            name: document.getElementById('roommate-name').value,
            email: document.getElementById('roommate-email').value
        };
        
        fetch('/api/shared/roommates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roommate)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add roommate');
            return response.json();
        })
        .then(data => {
            // Reset form
            this.reset();
            
            // Show notification
            showNotification('Roommate added successfully!');
            
            // Refresh roommate lists
            loadRoommates();
        })
        .catch(error => {
            console.error('Error adding roommate:', error);
            showNotification('Error adding roommate. Please try again.', 'error');
        });
    });
    
    // Shared expense form submission
    document.getElementById('shared-expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const paidById = parseInt(document.getElementById('paid-by').value);
        const amount = parseFloat(document.getElementById('shared-amount').value);
        
        // Get selected roommates
        const selectedRoommates = [];
        const checkedBoxes = document.querySelectorAll('.roommate-checklist input:checked');
        
        if (checkedBoxes.length === 0) {
            showNotification('Please select at least one roommate to share the expense', 'error');
            return;
        }
        
        const shareAmount = amount / checkedBoxes.length;
        
        checkedBoxes.forEach(checkbox => {
            selectedRoommates.push({
                roommate_id: parseInt(checkbox.value),
                amount: shareAmount
            });
        });
        
        const sharedExpense = {
            amount: amount,
            description: document.getElementById('shared-description').value,
            date: document.getElementById('shared-date').value,
            paid_by: paidById,
            shares: selectedRoommates
        };
        
        // Add to database via API
        fetch('/api/shared/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sharedExpense)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add shared expense');
            return response.json();
        })
        .then(data => {
            // Reset form
            this.reset();
            document.getElementById('shared-date').valueAsDate = new Date();
            
            // Show notification
            showNotification('Shared expense added successfully!');
            
            // Refresh shared expenses and balances
            loadSharedExpenses();
            loadBalances();
        })
        .catch(error => {
            console.error('Error adding shared expense:', error);
            showNotification('Error adding shared expense. Please try again.', 'error');
        });
    });
    
    // Shared budget form submission
    document.getElementById('shared-budget-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const budget = {
            category: document.getElementById('shared-budget-category').value,
            amount: parseFloat(document.getElementById('shared-budget-amount').value),
            month: document.getElementById('shared-budget-month').value
        };
        
        // Add to database via API
        fetch('/api/shared/budgets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(budget)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to set budget');
            return response.json();
        })
        .then(data => {
            // Reset form
            this.reset();
            document.getElementById('shared-budget-month').value = now.toISOString().slice(0, 7);
            
            // Show notification
            showNotification('Budget set successfully!');
            
            // Refresh budget status
            loadSharedBudgetStatus();
        })
        .catch(error => {
            console.error('Error setting budget:', error);
            showNotification('Error setting budget. Please try again.', 'error');
        });
    });
    
    // Initialize the page
    loadSharedExpenses();
    loadBalances();
    loadSharedBudgetStatus();
    loadNotifications();
});

function loadRoommates() {
    const roommateList = document.getElementById('roommate-list');
    if (!roommateList) {
        console.error('Roommate list element not found');
        return;
    }
    
    roommateList.innerHTML = '<p>Loading roommates...</p>';
    
    fetch('/api/shared/roommates')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load roommates');
            return response.json();
        })
        .then(roommates => {
            if (roommates.length === 0) {
                roommateList.innerHTML = '<p>No roommates added yet. Add your first roommate below.</p>';
                return;
            }
            
            roommateList.innerHTML = '';
            
            roommates.forEach(roommate => {
                const roommateItem = document.createElement('div');
                roommateItem.className = 'roommate-item';
                roommateItem.id = `roommate-${roommate.id}`;
                
                roommateItem.innerHTML = `
                    <div class="roommate-info">
                        <div class="roommate-name">${roommate.name}</div>
                        ${roommate.email ? `<div class="roommate-email">${roommate.email}</div>` : ''}
                    </div>
                    <div class="roommate-actions">
                        <button class="btn-edit" onclick="editRoommate(${roommate.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="deleteRoommate(${roommate.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                `;
                
                roommateList.appendChild(roommateItem);
            });
            
            // Update paid by selector
            const paidBySelect = document.getElementById('paid-by');
            if (paidBySelect) {
                paidBySelect.innerHTML = '<option value="">Select who paid</option>';
                
                roommates.forEach(roommate => {
                    const option = document.createElement('option');
                    option.value = roommate.id;
                    option.textContent = roommate.name;
                    paidBySelect.appendChild(option);
                });
            }
            
            // Update roommate checklist
            const roommateChecklist = document.getElementById('roommate-checklist');
            if (roommateChecklist) {
                roommateChecklist.innerHTML = '';
                
                roommates.forEach(roommate => {
                    const checklistItem = document.createElement('div');
                    checklistItem.className = 'roommate-checklist-item';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `roommate-${roommate.id}`;
                    checkbox.value = roommate.id;
                    checkbox.checked = true; // Check all by default
                    
                    const label = document.createElement('label');
                    label.htmlFor = `roommate-${roommate.id}`;
                    label.textContent = roommate.name;
                    
                    checklistItem.appendChild(checkbox);
                    checklistItem.appendChild(label);
                    roommateChecklist.appendChild(checklistItem);
                });
            }
        })
        .catch(error => {
            console.error('Error loading roommates:', error);
            roommateList.innerHTML = '<p>Error loading roommates. Please try again.</p>';
        });
}

function editRoommate(id) {
    const roommateItem = document.getElementById(`roommate-${id}`);
    if (!roommateItem) {
        console.error(`Roommate item with id ${id} not found`);
        return;
    }
    
    const roommateName = roommateItem.querySelector('.roommate-name').textContent;
    const roommateEmail = roommateItem.querySelector('.roommate-email')?.textContent || '';
    
    roommateItem.innerHTML = `
        <div class="edit-roommate-form">
            <h4>Edit Roommate</h4>
            <form id="edit-roommate-form-${id}">
                <div class="form-group">
                    <label for="edit-roommate-name-${id}">Name</label>
                    <input type="text" id="edit-roommate-name-${id}" value="${roommateName}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-roommate-email-${id}">Email (Optional)</label>
                    <input type="email" id="edit-roommate-email-${id}" value="${roommateEmail}">
                </div>
                
                <div class="form-actions">
                    <button type="submit"><i class="fas fa-save"></i> Save</button>
                    <button type="button" class="btn-cancel" onclick="cancelEditRoommate(${id})">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Add event listener to the form
    const form = document.getElementById(`edit-roommate-form-${id}`);
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const updatedRoommate = {
                name: document.getElementById(`edit-roommate-name-${id}`).value,
                email: document.getElementById(`edit-roommate-email-${id}`).value
            };
            
            fetch(`/api/shared/roommates/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedRoommate)
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to update roommate');
                return response.json();
            })
            .then(data => {
                showNotification('Roommate updated successfully!');
                loadRoommates();
            })
            .catch(error => {
                console.error('Error updating roommate:', error);
                showNotification('Error updating roommate. Please try again.', 'error');
            });
        });
    } else {
        console.error(`Edit form for roommate ${id} not found`);
    }
}

function cancelEditRoommate(id) {
    loadRoommates();
}

function deleteRoommate(id) {
    if (confirm('Are you sure you want to delete this roommate?')) {
        fetch(`/api/shared/roommates/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete roommate');
            return response.json();
        })
        .then(data => {
            showNotification('Roommate deleted successfully!');
            loadRoommates();
        })
        .catch(error => {
            console.error('Error deleting roommate:', error);
            showNotification('Error deleting roommate. Please try again.', 'error');
        });
    }
}

function loadSharedExpenses() {
    const sharedExpenseList = document.getElementById('shared-expense-list');
    if (!sharedExpenseList) {
        console.error('Shared expense list element not found');
        return;
    }
    
    sharedExpenseList.innerHTML = '<p>Loading shared expenses...</p>';
    
    fetch('/api/shared/expenses')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load shared expenses');
            return response.json();
        })
        .then(expenses => {
            sharedExpenseList.innerHTML = '';
            
            if (expenses.length === 0) {
                sharedExpenseList.innerHTML = '<p>No shared expenses recorded yet.</p>';
                return;
            }
            
            expenses.forEach(expense => {
                const expenseItem = document.createElement('div');
                expenseItem.className = 'shared-expense-item';
                
                const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                expenseItem.innerHTML = `
                    <div class="shared-expense-header">
                        <div class="shared-expense-title">${expense.description || 'Shared expense'}</div>
                        <div class="shared-expense-amount">₹${expense.amount.toFixed(2)}</div>
                    </div>
                    <div class="shared-expense-details">
                        <div>Paid by: ${expense.paid_by_name}</div>
                        <div>${formattedDate}</div>
                    </div>
                    <div class="shared-expense-shares" id="shares-${expense.id}">
                        <div>Loading shares...</div>
                    </div>
                `;
                
                sharedExpenseList.appendChild(expenseItem);
                
                // Load shares for this expense
                loadExpenseShares(expense.id);
            });
        })
        .catch(error => {
            console.error('Error loading shared expenses:', error);
            sharedExpenseList.innerHTML = '<p>Error loading shared expenses. Please try again.</p>';
        });
}

function loadExpenseShares(expenseId) {
    fetch(`/api/shared/expense-shares/${expenseId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load expense shares');
            return response.json();
        })
        .then(shares => {
            const sharesContainer = document.getElementById(`shares-${expenseId}`);
            if (!sharesContainer) {
                console.error(`Shares container for expense ${expenseId} not found`);
                return;
            }
            
            sharesContainer.innerHTML = '';
            
            shares.forEach(share => {
                const shareItem = document.createElement('div');
                shareItem.className = 'shared-expense-share';
                shareItem.innerHTML = `
                    <span>${share.roommate_name}</span>
                    <span>₹${share.share_amount.toFixed(2)}</span>
                `;
                sharesContainer.appendChild(shareItem);
            });
        })
        .catch(error => {
            console.error('Error loading expense shares:', error);
            const sharesContainer = document.getElementById(`shares-${expenseId}`);
            if (sharesContainer) {
                sharesContainer.innerHTML = '<p>Error loading shares.</p>';
            }
        });
}

function loadBalances() {
    const roommateBalances = document.getElementById('roommate-balances');
    const settlementsList = document.getElementById('settlements-list');
    
    if (!roommateBalances || !settlementsList) {
        console.error('Balance elements not found');
        return;
    }
    
    roommateBalances.innerHTML = '<p>Loading balances...</p>';
    settlementsList.innerHTML = '<p>Loading settlements...</p>';
    
    fetch('/api/shared/balances')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load balances');
            return response.json();
        })
        .then(data => {
            // Load roommate balances
            roommateBalances.innerHTML = '';
            
            if (data.balances.length === 0) {
                roommateBalances.innerHTML = '<p>No roommate data available.</p>';
            } else {
                data.balances.forEach(balance => {
                    const balanceCard = document.createElement('div');
                    balanceCard.className = 'balance-card';
                    
                    const balanceClass = balance.balance >= 0 ? 'positive' : 'negative';
                    const balanceText = balance.balance >= 0 ? 
                        `Gets back ₹${balance.balance.toFixed(2)}` : 
                        `Owes ₹${Math.abs(balance.balance).toFixed(2)}`;
                    
                    balanceCard.innerHTML = `
                        <h4>${balance.name}</h4>
                        <div class="balance-amount ${balanceClass}">${balanceText}</div>
                    `;
                    
                    roommateBalances.appendChild(balanceCard);
                });
            }
            
            // Load settlements
            settlementsList.innerHTML = '';
            
            if (data.settlements.length === 0) {
                settlementsList.innerHTML = '<p>All settled up!</p>';
            } else {
                data.settlements.forEach(settlement => {
                    const settlementItem = document.createElement('div');
                    settlementItem.className = 'settlement-item';
                    
                    settlementItem.innerHTML = `
                        <div class="settlement-details">
                            <div>${settlement.fromName} → ${settlement.toName}</div>
                        </div>
                        <div class="settlement-amount">₹${settlement.amount.toFixed(2)}</div>
                    `;
                    
                    settlementsList.appendChild(settlementItem);
                });
            }
        })
        .catch(error => {
            console.error('Error loading balances:', error);
            roommateBalances.innerHTML = '<p>Error loading balances.</p>';
            settlementsList.innerHTML = '<p>Error loading settlements.</p>';
        });
}

function loadSharedBudgetStatus() {
    const sharedBudgetSummary = document.getElementById('shared-budget-summary');
    if (!sharedBudgetSummary) {
        console.error('Shared budget summary element not found');
        return;
    }
    
    sharedBudgetSummary.innerHTML = '<p>Loading budget information...</p>';
    
    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Get all shared expenses and budgets
    Promise.all([
        fetch('/api/shared/expenses').then(response => {
            if (!response.ok) throw new Error('Failed to load shared expenses');
            return response.json();
        }),
        fetch('/api/shared/budgets').then(response => {
            if (!response.ok) throw new Error('Failed to load shared budgets');
            return response.json();
        })
    ])
    .then(([expenses, budgets]) => {
        // Filter expenses for current month
        const currentMonthExpenses = expenses.filter(expense => 
            expense.date.startsWith(currentMonth)
        );
        
        // Filter budgets for current month
        const currentMonthBudgets = budgets.filter(budget => 
            budget.month === currentMonth
        );
        
        // Group expenses by category
        const expensesByCategory = {};
        currentMonthExpenses.forEach(expense => {
            if (!expensesByCategory[expense.category]) {
                expensesByCategory[expense.category] = 0;
            }
            expensesByCategory[expense.category] += expense.amount;
        });
        
        // Create budget items
        sharedBudgetSummary.innerHTML = '';
        
        if (currentMonthBudgets.length === 0) {
            sharedBudgetSummary.innerHTML = '<p>No budgets set for this month.</p>';
            return;
        }
        
        currentMonthBudgets.forEach(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            const remaining = budget.amount - spent;
            
            // Determine remaining budget class
            let remainingClass = 'positive';
            if (remaining < 0) {
                remainingClass = 'negative';
            } else if (remaining < budget.amount * 0.2) {
                remainingClass = 'warning';
            }
            
            const budgetItem = document.createElement('div');
            budgetItem.className = 'shared-budget-item';
            
            budgetItem.innerHTML = `
                <div>
                    <div class="shared-budget-category">${budget.category}</div>
                    <div>Budget: ₹${budget.amount.toFixed(2)} | Spent: ₹${spent.toFixed(2)}</div>
                </div>
                <div class="shared-budget-remaining ${remainingClass}">₹${remaining.toFixed(2)}</div>
            `;
            
            sharedBudgetSummary.appendChild(budgetItem);
        });
    })
    .catch(error => {
        console.error('Error loading shared budget status:', error);
        sharedBudgetSummary.innerHTML = '<p>Error loading budget information. Please try again.</p>';
    });
}

function loadNotifications() {
    // For simplicity, we'll just show a message that notifications are available
    // In a real app, you would need to select a roommate first
    const notificationsList = document.getElementById('notifications-list');
    if (!notificationsList) {
        console.error('Notifications list element not found');
        return;
    }
    
    notificationsList.innerHTML = '<p>Select a roommate to view notifications</p>';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.error('Notification element not found');
        return;
    }
    
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'error') {
        notification.classList.add('error');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}