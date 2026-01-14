CREATE DATABASE IF NOT EXISTS virtual_atm;
USE virtual_atm;

CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type VARCHAR(10) CHECK (account_type IN ('SAVINGS', 'CURRENT')),
    balance DECIMAL(15,2) NOT NULL CHECK (balance >= 0),
    status VARCHAR(10) CHECK (status IN ('ACTIVE', 'BLOCKED', 'CLOSED')) DEFAULT 'ACTIVE',
    opened_at DATE DEFAULT (CURDATE()),

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE atm_cards (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    atm_card_number VARCHAR(20) UNIQUE NOT NULL,
    pin VARCHAR(255) NOT NULL,
    daily_withdraw_limit DECIMAL(10,2) DEFAULT 50000,
    expiry_date DATE NOT NULL,
    status VARCHAR(25) CHECK (status IN ('ACTIVE',
        'BLOCKED','CLOSED','TEMP_BLOCKED',
        'SUSPENDED','LOST','EXPIRED','DAILY_LIMIT_REACHED' )) DEFAULT 'ACTIVE',
    failed_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE atm_machines (
    machine_id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    cash_balance DECIMAL(15,2) CHECK (cash_balance >= 0),
    is_online BOOLEAN DEFAULT true,
    last_maintenance TIMESTAMP
);

CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT,
    machine_id INT,
    transaction_type VARCHAR(20) CHECK (
        transaction_type IN (
            'WITHDRAWAL', 
            'DEPOSIT', 
            'TRANSFER'
        )
    ),
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) CHECK (status IN ('COMPLETED', 'FAILED')),

    FOREIGN KEY (card_id) REFERENCES atm_cards(card_id),
    FOREIGN KEY (machine_id) REFERENCES atm_machines(machine_id)
);

CREATE TABLE atm_denominations (
    denomination_id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    note_value INT CHECK (note_value IN (500, 100, 50)),
    note_count INT CHECK (note_count >= 0),

    FOREIGN KEY (machine_id) REFERENCES atm_machines(machine_id),
    UNIQUE (machine_id, note_value)
);

CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT,
    machine_id INT,
    activity_type VARCHAR(20) CHECK (
        activity_type IN (
            'BALANCE_INQUIRY','MINI_STATEMENT',
            'PIN_CHANGE','LOGIN','LOGOUT','SESSION_TIMEOUT'
        )
    ),
    activity_details JSON,
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) CHECK (status IN ('SUCCESS', 'FAILED')),

    FOREIGN KEY (card_id) REFERENCES atm_cards(card_id),
    FOREIGN KEY (machine_id) REFERENCES atm_machines(machine_id)
);

CREATE TABLE atm_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT NOT NULL,
    machine_id INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (card_id) REFERENCES atm_cards(card_id),
    FOREIGN KEY (machine_id) REFERENCES atm_machines(machine_id)
);

