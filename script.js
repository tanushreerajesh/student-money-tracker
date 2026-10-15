/* =========================================================
   STUDENT MONEY TRACKER
   Fresh complete JavaScript
========================================================= */

const STORAGE_KEY = "studentMoneyTracker_v5";

const categories = [
    "Food",
    "Transport",
    "Shopping",
    "College",
    "Entertainment",
    "Technology",
    "Personal",
    "Other"
];

let selectedMonth = getCurrentMonthKey();

let currentFriends = [];


/* =========================================================
   BASIC HELPERS
========================================================= */

function money(value) {
    return `₹${Number(value || 0).toFixed(2)}`;
}


function number(value) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
}


function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}


function normalizeFriendName(name) {
    return String(name || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}


function displayFriendName(name) {
    return String(name || "")
        .trim()
        .replace(/\s+/g, " ");
}


function getCurrentMonthKey() {

    const date = new Date();

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}`;
}


function monthLabel(key) {

    const [year, month] = key.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        1
    );

    return date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });
}


function previousMonthKey(key) {

    const [year, month] = key.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 2,
        1
    );

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}`;
}


function nextMonthKey(key) {

    const [year, month] = key.split("-");

    const date = new Date(
        Number(year),
        Number(month),
        1
    );

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}`;
}


/* =========================================================
   DEFAULT DATA
========================================================= */

function createMonth() {

    return {
        allowance: 0,
        extraMoney: 0,

        expenses: [],

        savings: 0,

        friendPayments: {},
        debtsToFriends: []
    };
}


function createDefaultData() {

    return {
        months: {}
    };
}


let appData = loadData();


function loadData() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return createDefaultData();
        }

        const data = JSON.parse(saved);

        if (!data.months) {
            data.months = {};
        }

        return data;

    } catch (error) {

        console.error("Could not load saved data:", error);

        return createDefaultData();
    }
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}


function ensureMonth(key) {

    if (!appData.months[key]) {

        appData.months[key] = createMonth();

        saveData();
    }

    return appData.months[key];
}


function getMonth() {

    return ensureMonth(selectedMonth);
}


/* =========================================================
   ELEMENTS
========================================================= */

const els = {

    monthSelect: document.getElementById("monthSelect"),
    previousMonth: document.getElementById("previousMonth"),
    nextMonth: document.getElementById("nextMonth"),

    allowance: document.getElementById("allowance"),
    allowanceButton: document.getElementById("allowanceButton"),

    extraMoney: document.getElementById("extraMoney"),
    addMoneyButton: document.getElementById("addMoneyButton"),

    moneyStatus: document.getElementById("moneyStatus"),

    expenseName: document.getElementById("expenseName"),
    expenseAmount: document.getElementById("expenseAmount"),
    expenseCategory: document.getElementById("expenseCategory"),
    expenseButton: document.getElementById("expenseButton"),

    friendName: document.getElementById("friendName"),
    addFriendButton: document.getElementById("addFriendButton"),
    friendInputList: document.getElementById("friendInputList"),

    dashboardAllowance: document.getElementById("dashboardAllowance"),
    totalSpent: document.getElementById("totalSpent"),
    moneyLeft: document.getElementById("moneyLeft"),
    friendsOwe: document.getElementById("friendsOwe"),
    youOweFriends: document.getElementById("youOweFriends"),
    oweFriendName: document.getElementById("oweFriendName"),
    oweFriendAmount: document.getElementById("oweFriendAmount"),
    oweFriendReason: document.getElementById("oweFriendReason"),
    addOwedToFriendButton: document.getElementById("addOwedToFriendButton"),
    oweFriendStatus: document.getElementById("oweFriendStatus"),
    youOweList: document.getElementById("youOweList"),

    carryForward: document.getElementById("carryForward"),

    balanceWarning: document.getElementById("balanceWarning"),
    balanceGood: document.getElementById("balanceGood"),

    savingsAmount: document.getElementById("savingsAmount"),
    savingsButton: document.getElementById("savingsButton"),
    savingsStatus: document.getElementById("savingsStatus"),
    savingsInfo: document.getElementById("savingsInfo"),
    savingsResult: document.getElementById("savingsResult"),

    searchExpense: document.getElementById("searchExpense"),
    filterCategory: document.getElementById("filterCategory"),

    expenseList: document.getElementById("expenseList"),
    expenseCount: document.getElementById("expenseCount"),

    friendPaymentList: document.getElementById("friendPaymentList"),

    categoryChart: document.getElementById("categoryChart"),
    categoryTotal: document.getElementById("categoryTotal"),

    summaryMonth: document.getElementById("summaryMonth"),
    summaryAllowance: document.getElementById("summaryAllowance"),
    summaryExtra: document.getElementById("summaryExtra"),
    summaryCarry: document.getElementById("summaryCarry"),
    summaryAvailable: document.getElementById("summaryAvailable"),
    summarySpent: document.getElementById("summarySpent"),
    summarySavings: document.getElementById("summarySavings"),
    summaryCarryForward: document.getElementById("summaryCarryForward"),
    summaryFriendsOwe: document.getElementById("summaryFriendsOwe"),
    summaryRecovered: document.getElementById("summaryRecovered"),
    summaryExpenseCount: document.getElementById("summaryExpenseCount"),

    clearExpensesButton: document.getElementById("clearExpensesButton"),

    exportButton: document.getElementById("exportButton"),
    exportButtonBottom: document.getElementById("exportButtonBottom"),

    scrollExpenses: document.getElementById("scrollExpenses"),
    scrollSummary: document.getElementById("scrollSummary"),
    scrollSavings: document.getElementById("scrollSavings")
};


/* =========================================================
   MONTH DATA
========================================================= */

function getMonthExpenseTotal(data) {

    return roundMoney(
        data.expenses.reduce(
            (total, expense) =>
                total + number(expense.amount),
            0
        )
    );
}


/* =========================================================
   MONEY RECOVERED
========================================================= */

function getMoneyRecovered(data) {

    return roundMoney(
        Object.values(data.friendPayments || {})
            .reduce(
                (total, payment) =>
                    total + number(payment.paid),
                0
            )
    );
}


/* =========================================================
   FRIEND TOTALS
========================================================= */

function getFriendTotals(data) {

    const friends = {};

    /*
       Every expense stores its OWN friend list.

       Example:

       Breakfast:
       A + B

       Lunch:
       C

       They stay separate.
    */

    data.expenses.forEach(expense => {

        const names = Array.isArray(expense.friends)
            ? expense.friends
            : [];

        names.forEach(friend => {

            const cleanName = displayFriendName(friend);
            const key = normalizeFriendName(cleanName);

            if (!key) return;

            if (!friends[key]) {

                friends[key] = {
                    name: cleanName,
                    owed: 0,
                    paid: 0
                };
            }

            friends[key].owed += number(
                expense.friendShares?.[key] || 0
            );
        });
    });


    /*
       Add payments.
    */

    Object.entries(data.friendPayments || {})
        .forEach(([key, payment]) => {

            if (!friends[key]) {

                friends[key] = {
                    name: payment.name || key,
                    owed: 0,
                    paid: 0
                };
            }

            friends[key].paid += number(payment.paid);
        });


    Object.values(friends).forEach(friend => {

        friend.owed = roundMoney(friend.owed);
        friend.paid = roundMoney(friend.paid);

        friend.pending = roundMoney(
            Math.max(
                0,
                friend.owed - friend.paid
            )
        );
    });


    return friends;
}


function getFriendsPendingTotal(data) {

    return roundMoney(
        Object.values(getFriendTotals(data))
            .reduce(
                (total, friend) =>
                    total + friend.pending,
                0
            )
    );
}


/* =========================================================
   CARRY FORWARD
========================================================= */

/*
   We calculate previous month balance recursively.

   This means:

   August leftover
        ↓
   September
        ↓
   October
        ↓
   November

   Nothing gets lost.
*/

function getCarryForwardForMonth(key) {

    const previousKey = previousMonthKey(key);

    const previousData = appData.months[previousKey];

    if (!previousData) {
        return 0;
    }

    const previousCarry =
        getCarryForwardForMonth(previousKey);

    const previousAvailable =
        number(previousData.allowance) +
        number(previousData.extraMoney) +
        previousCarry;

    const previousSpent =
        getMonthExpenseTotal(previousData);

    const previousRecovered =
        getMoneyRecovered(previousData);

    const previousSavings =
        number(previousData.savings);

    const result =
        previousAvailable -
        previousSpent +
        previousRecovered -
        previousSavings;

    return roundMoney(
        Math.max(0, result)
    );
}


/* =========================================================
   CURRENT MONEY
========================================================= */

function getTotalAvailable(data) {

    const carry =
        getCarryForwardForMonth(selectedMonth);

    return roundMoney(
        number(data.allowance) +
        number(data.extraMoney) +
        carry
    );
}


function getMoneyLeft(data) {

    return roundMoney(
        getTotalAvailable(data) -
        getMonthExpenseTotal(data) +
        getMoneyRecovered(data)
    );
}


function getCarryForwardAfterSavings(data) {

    const left = getMoneyLeft(data);

    const savings = Math.min(
        number(data.savings),
        Math.max(0, left)
    );

    return roundMoney(
        Math.max(
            0,
            left - savings
        )
    );
}


/* =========================================================
   MONTH SELECTOR
========================================================= */

function buildMonthSelector() {

    const keys = new Set();

    const current = new Date();

    /*
       Always show a useful range.
    */

    for (let i = -6; i <= 6; i++) {

        const date = new Date(
            current.getFullYear(),
            current.getMonth() + i,
            1
        );

        const key =
            `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

        keys.add(key);
    }


    Object.keys(appData.months)
        .forEach(key => keys.add(key));


    keys.add(selectedMonth);


    const sorted = Array.from(keys)
        .sort();


    els.monthSelect.innerHTML = "";


    sorted.forEach(key => {

        const option =
            document.createElement("option");

        option.value = key;
        option.textContent = monthLabel(key);

        if (key === selectedMonth) {
            option.selected = true;
        }

        els.monthSelect.appendChild(option);
    });
}


/* =========================================================
   FRIEND INPUT
========================================================= */

function addFriendToCurrentExpense() {

    const raw =
        els.friendName.value.trim();

    if (!raw) {

        alert("Please enter your friend's name.");

        return;
    }


    const name = displayFriendName(raw);

    const key = normalizeFriendName(name);


    /*
       Do not add the same friend twice
       to ONE expense.
    */

    const alreadyAdded =
        currentFriends.some(
            friend =>
                normalizeFriendName(friend) === key
        );


    if (alreadyAdded) {

        alert(`${name} is already added to this expense.`);

        els.friendName.value = "";

        return;
    }


    currentFriends.push(name);

    els.friendName.value = "";

    renderCurrentFriends();
}


function renderCurrentFriends() {

    els.friendInputList.innerHTML = "";


    currentFriends.forEach((friend, index) => {

        const chip =
            document.createElement("div");

        chip.className = "friend-chip";


        const name =
            document.createElement("span");

        name.textContent = friend;


        const remove =
            document.createElement("button");

        remove.textContent = "×";

        remove.title = "Remove friend";


        remove.addEventListener(
            "click",
            () => {

                currentFriends.splice(index, 1);

                renderCurrentFriends();
            }
        );


        chip.appendChild(name);
        chip.appendChild(remove);

        els.friendInputList.appendChild(chip);
    });
}


/* =========================================================
   ADD EXPENSE
========================================================= */

function addExpense() {

    const name =
        els.expenseName.value.trim();

    const amount =
        number(els.expenseAmount.value);

    const category =
        els.expenseCategory.value;


    if (!name) {

        alert("Please enter an expense name.");

        return;
    }


    if (amount <= 0) {

        alert("Please enter a valid expense amount.");

        return;
    }


    const data = getMonth();


    /*
       Calculate each friend's exact share.

       Example:

       ₹400
       You + Sasi

       Total people = 2

       Sasi owes ₹200.
    */

    const totalPeople =
        currentFriends.length + 1;


    const share =
        roundMoney(
            amount / totalPeople
        );


    const friendShares = {};


    currentFriends.forEach(friend => {

        const key =
            normalizeFriendName(friend);

        friendShares[key] = share;
    });


    const expense = {

        id:
            Date.now().toString() +
            Math.random().toString(16).slice(2),

        name,

        amount,

        category,

        date:
            new Date().toISOString(),

        friends:
            [...currentFriends],

        friendShares

    };


    data.expenses.push(expense);


    saveData();


    /*
       VERY IMPORTANT:

       Clear the friend list after saving.

       This means:

       Breakfast:
       A B

       Then new Lunch:
       C

       C does NOT inherit A and B.
    */

    currentFriends = [];

    renderCurrentFriends();


    els.expenseName.value = "";
    els.expenseAmount.value = "";

    els.expenseCategory.value = "Food";


    els.moneyStatus.textContent =
        currentFriends.length === 0
            ? "Expense added successfully 💜"
            : "Expense added.";


    renderAll();
}


/* =========================================================
   ALLOWANCE
========================================================= */

function saveAllowance() {

    const value =
        number(els.allowance.value);


    if (value < 0) {

        alert("Allowance cannot be negative.");

        return;
    }


    const data = getMonth();

    data.allowance = roundMoney(value);

    saveData();


    els.moneyStatus.textContent =
        "Monthly allowance saved 💜";


    renderAll();
}


/* =========================================================
   EXTRA MONEY
========================================================= */

function addExtraMoney() {

    const value =
        number(els.extraMoney.value);


    if (value <= 0) {

        alert("Please enter a valid amount.");

        return;
    }


    const data = getMonth();

    data.extraMoney =
        roundMoney(
            number(data.extraMoney) + value
        );


    saveData();


    els.extraMoney.value = "";


    els.moneyStatus.textContent =
        `${money(value)} added successfully 💜`;


    renderAll();
}


/* =========================================================
   FRIEND PAYMENT
========================================================= */

function recordFriendPayment(friendKey) {

    const data = getMonth();

    const totals =
        getFriendTotals(data);

    const friend =
        totals[friendKey];


    if (!friend) {
        return;
    }


    if (friend.pending <= 0) {

        alert("This friend has no pending amount.");

        return;
    }


    const answer =
        prompt(
            `How much did ${friend.name} pay?\n\nPending: ${money(friend.pending)}`
        );


    if (answer === null) {
        return;
    }


    const amount =
        number(answer);


    if (amount <= 0) {

        alert("Enter a valid payment amount.");

        return;
    }


    if (amount > friend.pending) {

        alert(
            `Payment cannot be more than the pending amount of ${money(friend.pending)}.`
        );

        return;
    }


    if (!data.friendPayments[friendKey]) {

        data.friendPayments[friendKey] = {

            name: friend.name,

            paid: 0

        };
    }


    data.friendPayments[friendKey].paid =
        roundMoney(
            number(
                data.friendPayments[friendKey].paid
            ) + amount
        );


    saveData();


    alert(
        `${friend.name} paid ${money(amount)} 💜\n\n` +
        `Remaining: ${money(friend.pending - amount)}`
    );


    renderAll();
}


/* =========================================================
   WHATSAPP REMINDER
========================================================= */

function remindFriend(friendKey) {

    const data = getMonth();

    const totals =
        getFriendTotals(data);

    const friend =
        totals[friendKey];


    if (!friend || friend.pending <= 0) {

        alert("This friend has no pending amount.");

        return;
    }


    let phone =
        prompt(
            `Enter ${friend.name}'s WhatsApp number.\n\n` +
            `Use country code.\nExample: 919876543210`
        );


    if (!phone) {
        return;
    }


    phone =
        phone.replace(/\D/g, "");


    if (phone.length < 10) {

        alert("Please enter a valid WhatsApp number.");

        return;
    }


    const message =
        `Hey ${friend.name}! 💜 ` +
        `Just a small reminder about the ₹${friend.pending.toFixed(2)} ` +
        `you still owe me from our shared expenses. Thank you! 😊`;


    const url =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;


    window.open(url, "_blank");
}


/* =========================================================
   FRIEND PAYMENT LIST
========================================================= */

function renderFriendPayments() {

    const data = getMonth();

    const friends =
        getFriendTotals(data);


    els.friendPaymentList.innerHTML = "";


    const entries =
        Object.entries(friends)
            .filter(
                ([, friend]) =>
                    friend.owed > 0
            );


    if (entries.length === 0) {

        els.friendPaymentList.innerHTML =
            `<div class="empty">
                No shared expenses yet 💜
            </div>`;

        return;
    }


    entries.forEach(
        ([key, friend]) => {

            const card =
                document.createElement("div");

            card.className =
                "friend-payment";


            const info =
                document.createElement("div");

            info.className =
                "friend-info";


            const strong =
                document.createElement("strong");

            strong.textContent =
                `👤 ${friend.name}`;


            const small =
                document.createElement("small");


            if (friend.pending > 0) {

                small.textContent =
                    `Owed: ${money(friend.owed)} · ` +
                    `Paid: ${money(friend.paid)} · ` +
                    `Pending: ${money(friend.pending)}`;

            } else {

                small.textContent =
                    `Owed: ${money(friend.owed)} · ` +
                    `Fully paid ✓`;
            }


            info.appendChild(strong);
            info.appendChild(small);


            const actions =
                document.createElement("div");

            actions.className =
                "friend-actions";


            if (friend.pending > 0) {

                const paymentButton =
                    document.createElement("button");

                paymentButton.className =
                    "status-btn pending-btn";

                paymentButton.textContent =
                    "💵 Payment";


                paymentButton.addEventListener(
                    "click",
                    () =>
                        recordFriendPayment(key)
                );


                const remindButton =
                    document.createElement("button");

                remindButton.className =
                    "status-btn remind-btn";

                remindButton.textContent =
                    "💬 Remind";


                remindButton.addEventListener(
                    "click",
                    () =>
                        remindFriend(key)
                );


                actions.appendChild(paymentButton);
                actions.appendChild(remindButton);

            } else {

                const paidButton =
                    document.createElement("button");

                paidButton.className =
                    "status-btn paid-btn";

                paidButton.textContent =
                    "✓ Paid";

                actions.appendChild(paidButton);
            }


            card.appendChild(info);
            card.appendChild(actions);

            els.friendPaymentList.appendChild(card);
        }
    );
}


/* =========================================================
   EXPENSE LIST
========================================================= */

function renderExpenses() {

    const data = getMonth();

    const search =
        els.searchExpense.value
            .trim()
            .toLowerCase();

    const category =
        els.filterCategory.value;


    let expenses =
        [...data.expenses];


    if (search) {

        expenses =
            expenses.filter(
                expense =>
                    expense.name
                        .toLowerCase()
                        .includes(search)
            );
    }


    if (category !== "All") {

        expenses =
            expenses.filter(
                expense =>
                    expense.category === category
            );
    }


    expenses.reverse();


    els.expenseList.innerHTML = "";


    if (expenses.length === 0) {

        els.expenseList.innerHTML =
            `<div class="empty">
                No expenses found 💜
            </div>`;

    } else {

        expenses.forEach(expense => {

            renderSingleExpense(expense);
        });
    }


    els.expenseCount.textContent =
        `${data.expenses.length} expense${data.expenses.length === 1 ? "" : "s"}`;
}


function renderSingleExpense(expense) {

    const item =
        document.createElement("div");

    item.className =
        "expense-item";


    const left =
        document.createElement("div");

    left.className =
        "expense-left";


    const title =
        document.createElement("div");

    title.className =
        "expense-name";

    title.textContent =
        expense.name;


    const meta =
        document.createElement("div");

    meta.className =
        "expense-meta";


    const date =
        document.createElement("span");

    date.textContent =
        formatDate(expense.date);


    const category =
        document.createElement("span");

    category.className =
        "category-tag";

    category.textContent =
        `🏷️ ${expense.category}`;


    meta.appendChild(date);
    meta.appendChild(category);


    if (
        Array.isArray(expense.friends) &&
        expense.friends.length > 0
    ) {

        const friendTag =
            document.createElement("span");

        friendTag.className =
            "friend-tag";

        friendTag.textContent =
            `👯 ${expense.friends.length} friend${
                expense.friends.length === 1 ? "" : "s"
            }`;


        meta.appendChild(friendTag);


        /*
           Show the exact friends for THIS expense.
        */

        expense.friends.forEach(friend => {

            const tag =
                document.createElement("span");

            tag.className =
                "friend-tag";

            tag.textContent =
                `👤 ${friend}`;

            meta.appendChild(tag);
        });
    }


    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "delete-expense";

    deleteButton.textContent =
        "Delete";


    deleteButton.addEventListener(
        "click",
        () => deleteExpense(expense.id)
    );


    left.appendChild(title);
    left.appendChild(meta);
    left.appendChild(deleteButton);


    const amount =
        document.createElement("div");

    amount.className =
        "expense-amount";

    amount.textContent =
        money(expense.amount);


    item.appendChild(left);
    item.appendChild(amount);


    els.expenseList.appendChild(item);
}


function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short"
        }
    );
}


/* =========================================================
   DELETE EXPENSE
========================================================= */

function deleteExpense(id) {

    const data = getMonth();


    const expense =
        data.expenses.find(
            item => item.id === id
        );


    if (!expense) {
        return;
    }


    const okay =
        confirm(
            `Delete "${expense.name}" (${money(expense.amount)})?`
        );


    if (!okay) {
        return;
    }


    data.expenses =
        data.expenses.filter(
            item => item.id !== id
        );


    saveData();

    renderAll();
}


/* =========================================================
   CATEGORY CHART
========================================================= */

function renderCategoryChart() {

    const data = getMonth();

    const totals = {};


    categories.forEach(category => {

        totals[category] = 0;
    });


    data.expenses.forEach(expense => {

        if (!totals[expense.category]) {

            totals[expense.category] = 0;
        }

        totals[expense.category] +=
            number(expense.amount);
    });


    const total =
        Object.values(totals)
            .reduce(
                (sum, value) =>
                    sum + value,
                0
            );


    els.categoryTotal.textContent =
        money(total);


    els.categoryChart.innerHTML = "";


    if (total === 0) {

        els.categoryChart.innerHTML =
            `<div class="empty">
                Add expenses to see your spending chart 📊
            </div>`;

        return;
    }


    categories.forEach(category => {

        const amount =
            totals[category];


        if (amount <= 0) {
            return;
        }


        const percentage =
            (amount / total) * 100;


        const row =
            document.createElement("div");

        row.className =
            "category-row";


        const header =
            document.createElement("div");

        header.className =
            "category-header";


        const name =
            document.createElement("span");

        name.textContent =
            category;


        const value =
            document.createElement("span");

        value.textContent =
            `${money(amount)} · ${percentage.toFixed(1)}%`;


        header.appendChild(name);
        header.appendChild(value);


        const bg =
            document.createElement("div");

        bg.className =
            "bar-bg";


        const fill =
            document.createElement("div");

        fill.className =
            "bar-fill";


        fill.style.width =
            `${percentage}%`;


        bg.appendChild(fill);

        row.appendChild(header);
        row.appendChild(bg);

        els.categoryChart.appendChild(row);
    });
}


/* =========================================================
   SAVINGS
========================================================= */

function saveSavings() {

    const value =
        number(els.savingsAmount.value);


    if (value < 0) {

        alert("Savings cannot be negative.");

        return;
    }


    const data = getMonth();

    const available =
        getMoneyLeft(data);


    if (value > available) {

        alert(
            `You currently have only ${money(available)} available.`
        );

        return;
    }


    data.savings =
        roundMoney(value);


    saveData();


    els.savingsAmount.value = "";


    renderAll();
}


function renderSavings() {

    const data = getMonth();

    const savings =
        number(data.savings);

    const carry =
        getCarryForwardAfterSavings(data);


    els.savingsStatus.textContent =
        savings > 0
            ? money(savings)
            : "Not set";


    els.savingsResult.textContent =
        `Savings: ${money(savings)} · Carry Forward: ${money(carry)}`;


    if (savings > 0) {

        els.savingsInfo.textContent =
            `You are saving ${money(savings)} this month. ` +
            `${money(carry)} will be available for next month.`;

    } else {

        els.savingsInfo.textContent =
            "Set an amount you want to save from your remaining balance.";
    }
}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const data = getMonth();

    const available =
        getTotalAvailable(data);

    const spent =
        getMonthExpenseTotal(data);

    const recovered =
        getMoneyRecovered(data);

    const left =
        getMoneyLeft(data);

    const friendsPending =
        getFriendsPendingTotal(data);

    const carry =
        getCarryForwardForMonth(
            selectedMonth
        );


    els.dashboardAllowance.textContent =
        money(available);

    els.totalSpent.textContent =
        money(spent);

    els.moneyLeft.textContent =
        money(left);

    els.friendsOwe.textContent =
        money(friendsPending);

    const debts = Array.isArray(data.debtsToFriends) ? data.debtsToFriends : [];
    const owingTotal = debts.reduce((sum, debt) => sum + Math.max(0, number(debt.amount) - number(debt.paid)), 0);
    if (els.youOweFriends) els.youOweFriends.textContent = money(owingTotal);


    els.carryForward.textContent =
        `Previous Month Balance: ${money(carry)}`;


    /*
       Balance warning / good message.
    */

    els.balanceWarning.style.display = "none";
    els.balanceGood.style.display = "none";


    if (left < 0) {

        els.balanceWarning.style.display =
            "block";

        els.balanceWarning.textContent =
            `⚠️ You have exceeded your available money by ${money(Math.abs(left))}.`;

    } else {

        els.balanceGood.style.display =
            "block";

        els.balanceGood.textContent =
            `💜 You have ${money(left)} available right now.`;
    }
}


/* =========================================================
   MONTHLY SUMMARY
========================================================= */

function renderSummary() {

    const data = getMonth();

    const allowance =
        number(data.allowance);

    const extra =
        number(data.extraMoney);

    const carry =
        getCarryForwardForMonth(
            selectedMonth
        );

    const available =
        getTotalAvailable(data);

    const spent =
        getMonthExpenseTotal(data);

    const savings =
        number(data.savings);

    const carryForward =
        getCarryForwardAfterSavings(data);

    const friendsOwe =
        getFriendsPendingTotal(data);

    const recovered =
        getMoneyRecovered(data);


    els.summaryMonth.textContent =
        monthLabel(selectedMonth);

    els.summaryAllowance.textContent =
        money(allowance);

    els.summaryExtra.textContent =
        money(extra);

    els.summaryCarry.textContent =
        money(carry);

    els.summaryAvailable.textContent =
        money(available);

    els.summarySpent.textContent =
        money(spent);

    els.summarySavings.textContent =
        money(savings);

    els.summaryCarryForward.textContent =
        money(carryForward);

    els.summaryFriendsOwe.textContent =
        money(friendsOwe);

    els.summaryRecovered.textContent =
        money(recovered);

    els.summaryExpenseCount.textContent =
        data.expenses.length;
}


/* =========================================================
   INPUT VALUES
========================================================= */

function loadInputValues() {

    const data = getMonth();

    els.allowance.value =
        data.allowance || "";

    els.savingsAmount.value =
        data.savings || "";
}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV() {

    const data = getMonth();


    if (data.expenses.length === 0) {

        alert("There are no expenses to export.");

        return;
    }


    const rows = [];


    rows.push([
        "Date",
        "Expense",
        "Category",
        "Amount",
        "Friends",
        "Friend Share Each"
    ]);


    data.expenses.forEach(expense => {

        const friends =
            Array.isArray(expense.friends)
                ? expense.friends
                : [];


        let share = "";


        if (friends.length > 0) {

            share =
                number(
                    expense.amount
                ) /
                (friends.length + 1);
        }


        rows.push([
            formatDate(expense.date),
            expense.name,
            expense.category,
            number(expense.amount).toFixed(2),
            friends.join(" | "),
            friends.length
                ? share.toFixed(2)
                : ""
        ]);
    });


    const csv =
        rows.map(row =>
            row.map(value =>
                `"${String(value)
                    .replace(/"/g, '""')}"`
            ).join(",")
        ).join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:"text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `student-money-${selectedMonth}.csv`;


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);
}


/* =========================================================
   CLEAR MONTH
========================================================= */

function clearCurrentMonth() {

    const data = getMonth();


    if (
        data.expenses.length === 0 &&
        number(data.extraMoney) === 0 &&
        number(data.allowance) === 0 &&
        number(data.savings) === 0
    ) {

        alert("This month is already empty.");

        return;
    }


    const okay =
        confirm(
            `Clear ALL data for ${monthLabel(selectedMonth)}?\n\n` +
            `This will remove allowance, extra money, expenses, savings and friend payments for this month.`
        );


    if (!okay) {
        return;
    }


    appData.months[selectedMonth] =
        createMonth();


    saveData();


    currentFriends = [];

    renderCurrentFriends();

    renderAll();
}


/* =========================================================
   SCROLL ACTIONS
========================================================= */

function setupQuickActions() {

    els.scrollExpenses.addEventListener(
        "click",
        () => {

            els.expensesSection.scrollIntoView({
                behavior:"smooth"
            });
        }
    );


    els.scrollSummary.addEventListener(
        "click",
        () => {

            document.getElementById(
                "summarySection"
            ).scrollIntoView({
                behavior:"smooth"
            });
        }
    );


    els.scrollSavings.addEventListener(
        "click",
        () => {

            document.getElementById(
                "savingsSection"
            ).scrollIntoView({
                behavior:"smooth"
            });
        }
    );
}


/* =========================================================
   MONTH NAVIGATION
========================================================= */

function changeMonth(key) {

    selectedMonth = key;

    ensureMonth(selectedMonth);

    buildMonthSelector();

    currentFriends = [];

    renderCurrentFriends();

    loadInputValues();

    renderAll();
}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    if (els.addOwedToFriendButton) els.addOwedToFriendButton.addEventListener("click", addDebtToFriend);

    els.allowanceButton.addEventListener(
        "click",
        saveAllowance
    );


    els.addMoneyButton.addEventListener(
        "click",
        addExtraMoney
    );


    els.expenseButton.addEventListener(
        "click",
        addExpense
    );


    els.addFriendButton.addEventListener(
        "click",
        addFriendToCurrentExpense
    );


    els.friendName.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                addFriendToCurrentExpense();
            }
        }
    );


    els.searchExpense.addEventListener(
        "input",
        renderExpenses
    );


    els.filterCategory.addEventListener(
        "change",
        renderExpenses
    );


    els.savingsButton.addEventListener(
        "click",
        saveSavings
    );


    els.previousMonth.addEventListener(
        "click",
        () => {

            changeMonth(
                previousMonthKey(selectedMonth)
            );
        }
    );


    els.nextMonth.addEventListener(
        "click",
        () => {

            changeMonth(
                nextMonthKey(selectedMonth)
            );
        }
    );


    els.monthSelect.addEventListener(
        "change",
        () => {

            changeMonth(
                els.monthSelect.value
            );
        }
    );


    els.clearExpensesButton.addEventListener(
        "click",
        clearCurrentMonth
    );


    els.exportButton.addEventListener(
        "click",
        exportCSV
    );


    els.exportButtonBottom.addEventListener(
        "click",
        exportCSV
    );


    setupQuickActions();
}



/* =========================================================
   DASHBOARD SPENDING OVERVIEW + RECENT EXPENSES
========================================================= */
function renderSpendingOverview() {
    const data = getMonth();
    const palette = {
        Food: '#174f91', Transport: '#2677ce', Entertainment: '#65a8f5',
        Shopping: '#3e8fe8', College: '#82b8f6', Technology: '#6a78db',
        Personal: '#29a69a', Other: '#a5c9f5'
    };
    const totals = {};
    data.expenses.forEach(expense => {
        const category = expense.category || 'Other';
        totals[category] = (totals[category] || 0) + number(expense.amount);
    });
    const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
    const donut = document.getElementById('spendingDonut');
    const legend = document.getElementById('spendingLegend');
    const totalLabel = document.getElementById('donutTotal');
    const monthLabel = document.getElementById('overviewMonth');
    const monthSelect = document.getElementById('monthSelect');
    if (monthLabel && monthSelect) monthLabel.textContent = monthSelect.options[monthSelect.selectedIndex]?.text || 'This month';
    if (totalLabel) totalLabel.textContent = money(total).replace(/\.00$/, '');
    if (!donut || !legend) return;
    if (!total) {
        donut.style.background = '#e8f0fa';
        legend.innerHTML = '<div class="empty">Add expenses to see your spending overview.</div>';
        return;
    }
    let angle = 0;
    const stops = [];
    Object.entries(totals).sort((a,b) => b[1]-a[1]).forEach(([category, amount]) => {
        const end = angle + amount / total * 360;
        stops.push(`${palette[category] || palette.Other} ${angle}deg ${end}deg`);
        angle = end;
    });
    donut.style.background = `conic-gradient(${stops.join(',')})`;
    legend.innerHTML = '';
    Object.entries(totals).sort((a,b) => b[1]-a[1]).forEach(([category, amount]) => {
        const row = document.createElement('div'); row.className = 'legend-row';
        const left = document.createElement('div'); left.className = 'legend-category';
        const dot = document.createElement('span'); dot.className = 'legend-dot'; dot.style.background = palette[category] || palette.Other;
        const name = document.createElement('span'); name.textContent = category === 'Food' ? 'Food & Groceries' : category;
        const value = document.createElement('strong'); value.textContent = money(amount).replace(/\.00$/, '');
        const percent = document.createElement('span'); percent.className = 'legend-percent'; percent.textContent = `${Math.round(amount/total*100)}%`;
        left.append(dot,name); row.append(left,value,percent); legend.appendChild(row);
    });
}

function renderRecentExpenses() {
    const body = document.getElementById('recentExpensesBody');
    if (!body) return;
    const expenses = [...getMonth().expenses].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    body.innerHTML = '';
    if (!expenses.length) {
        body.innerHTML = '<tr><td colspan="5" class="empty-cell">No expenses yet. Add an expense to see it here.</td></tr>';
        return;
    }
    const categoryColors = {Food:'food',Transport:'transport',Entertainment:'entertainment',Shopping:'shopping',College:'college',Technology:'technology',Personal:'personal',Other:'other'};
    const icons = {Food:'♜',Transport:'▣',Entertainment:'▷',Shopping:'▱',College:'▤',Technology:'▣',Personal:'✦',Other:'•'};
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        const date = document.createElement('td'); date.textContent = formatDate(expense.date);
        const description = document.createElement('td'); description.className = 'recent-description';
        const icon = document.createElement('span'); icon.className = 'recent-row-icon'; icon.textContent = icons[expense.category] || '•';
        const name = document.createElement('span'); name.textContent = expense.name;
        description.append(icon,name);
        const category = document.createElement('td'); const tag = document.createElement('span'); tag.className = `recent-category ${categoryColors[expense.category] || 'other'}`; tag.textContent = expense.category || 'Other'; category.appendChild(tag);
        const amount = document.createElement('td'); amount.className = 'recent-amount'; amount.textContent = money(expense.amount).replace(/\.00$/, '');
        const arrow = document.createElement('td'); arrow.className = 'recent-arrow'; arrow.textContent = '›';
        row.append(date,description,category,amount,arrow); body.appendChild(row);
    });
}

/* =========================================================
   MONEY YOU OWE FRIENDS
========================================================= */
function addDebtToFriend() {
    const name = displayFriendName(els.oweFriendName.value);
    const amount = roundMoney(number(els.oweFriendAmount.value));
    const reason = String(els.oweFriendReason.value || '').trim() || 'Shared expense';
    if (!name) { alert("Enter your friend's name."); els.oweFriendName.focus(); return; }
    if (amount <= 0) { alert('Enter an amount greater than ₹0.'); els.oweFriendAmount.focus(); return; }
    const data = getMonth();
    if (!Array.isArray(data.debtsToFriends)) data.debtsToFriends = [];
    data.debtsToFriends.push({ id: Date.now().toString() + Math.random().toString(16).slice(2), name, reason, amount, paid: 0, createdAt: new Date().toISOString() });
    saveData();
    els.oweFriendName.value = '';
    els.oweFriendAmount.value = '';
    els.oweFriendReason.value = '';
    if (els.oweFriendStatus) { els.oweFriendStatus.textContent = 'Amount added successfully.'; els.oweFriendStatus.style.color = '#16734a'; }
    renderAll();
}

function renderDebtsToFriends() {
    if (!els.youOweList) return;
    const data = getMonth();
    if (!Array.isArray(data.debtsToFriends)) data.debtsToFriends = [];
    els.youOweList.innerHTML = '';
    const pending = data.debtsToFriends.filter(d => number(d.amount) - number(d.paid) > 0.009);
    if (!pending.length) {
        const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = 'No pending payments to friends.'; els.youOweList.appendChild(empty); return;
    }
    pending.forEach(debt => {
        const card = document.createElement('div'); card.className = 'friend-payment debt-payment-card';
        const info = document.createElement('div'); info.className = 'friend-info';
        const title = document.createElement('strong'); title.textContent = debt.name + ' · ' + debt.reason;
        const detail = document.createElement('small');
        detail.textContent = `Owed: ${money(debt.amount)} · Paid: ${money(debt.paid)} · Pending: ${money(Math.max(0, debt.amount - debt.paid))}`;
        info.append(title, detail);
        const actions = document.createElement('div'); actions.className = 'friend-actions';
        const pay = document.createElement('button'); pay.type = 'button'; pay.className = 'status-btn pending-btn'; pay.textContent = '₹ Record payment'; pay.addEventListener('click', () => recordDebtPayment(debt.id));
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'status-btn delete-debt-btn'; remove.textContent = 'Delete'; remove.addEventListener('click', () => deleteDebt(debt.id));
        actions.append(pay, remove); card.append(info, actions); els.youOweList.appendChild(card);
    });
}

function recordDebtPayment(id) {
    const data = getMonth();
    const debt = (data.debtsToFriends || []).find(item => item.id === id);
    if (!debt) return;
    const pending = Math.max(0, roundMoney(number(debt.amount) - number(debt.paid)));
    const input = prompt(`Pending amount: ${money(pending)}\nEnter how much you paid:`, pending.toFixed(2));
    if (input === null) return;
    const amount = roundMoney(number(input));
    if (amount <= 0 || amount > pending) { alert(`Enter an amount between ₹0.01 and ${money(pending)}.`); return; }
    debt.paid = roundMoney(number(debt.paid) + amount);
    saveData(); renderAll();
}

function deleteDebt(id) {
    if (!confirm('Delete this amount you owe?')) return;
    const data = getMonth();
    data.debtsToFriends = (data.debtsToFriends || []).filter(item => item.id !== id);
    saveData(); renderAll();
}

/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderAll() {

    ensureMonth(selectedMonth);

    buildMonthSelector();

    loadInputValues();

    renderDashboard();

    renderSpendingOverview();

    renderRecentExpenses();

    renderExpenses();

    renderFriendPayments();

    renderDebtsToFriends();

    renderCategoryChart();

    renderSavings();

    renderSummary();
}


/* =========================================================
   START
========================================================= */

function startApp() {

    ensureMonth(selectedMonth);

    setupEvents();

    renderCurrentFriends();

    renderAll();
}


startApp();