-- JCU Gym Management System Database Schema
-- SQLite Database Setup

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    student_id TEXT UNIQUE, -- JCU Student ID
    role TEXT CHECK(role IN ('student', 'staff', 'admin')) NOT NULL,
    membership_type TEXT CHECK(membership_type IN ('1-trimester', '3-trimester', '1-year', 'premium', 'guest')) NOT NULL,
    status TEXT CHECK(status IN ('pending', 'approved', 'suspended', 'expired')) DEFAULT 'pending',
    phone TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    approval_date DATETIME,
    expiry_date DATE, -- Membership expiry date
    suspension_count INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    total_workouts INTEGER DEFAULT 0,
    -- Billing Information
    payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
    payment_method TEXT CHECK(payment_method IN ('credit_card', 'bank_transfer', 'paypal', 'cash', 'waived')) DEFAULT 'credit_card',
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_date DATETIME,
    payment_reference TEXT, -- Transaction ID or reference
    billing_address TEXT,
    -- Preferences
    enable_notifications BOOLEAN DEFAULT true,
    share_achievements BOOLEAN DEFAULT true,
    show_on_leaderboard BOOLEAN DEFAULT true,
    allow_buddy_requests BOOLEAN DEFAULT true,
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    notification_push BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gym sessions table
CREATE TABLE IF NOT EXISTS gym_sessions (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL,
    current_bookings INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    type TEXT CHECK(type IN ('general', 'class', 'personal-training')) NOT NULL,
    instructor TEXT,
    description TEXT,
    difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
    waitlist_count INTEGER DEFAULT 0,
    price DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('confirmed', 'cancelled', 'no-show', 'completed')) DEFAULT 'confirmed',
    check_in_time DATETIME,
    check_out_time DATETIME,
    notes TEXT,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    feedback TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES gym_sessions (id) ON DELETE CASCADE
);

-- Waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    estimated_wait_time INTEGER,
    notification_sent BOOLEAN DEFAULT false,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES gym_sessions (id) ON DELETE CASCADE
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT CHECK(category IN ('attendance', 'streak', 'milestone', 'social')) NOT NULL,
    criteria TEXT NOT NULL,
    points INTEGER NOT NULL,
    rarity TEXT CHECK(rarity IN ('common', 'rare', 'epic', 'legendary')) NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    progress REAL DEFAULT 0.0 CHECK(progress BETWEEN 0 AND 100),
    is_completed BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('booking_reminder', 'waitlist_update', 'achievement', 'announcement', 'system')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT, -- JSON data
    read BOOLEAN DEFAULT false,
    scheduled_for DATETIME,
    channels TEXT NOT NULL, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('facility', 'session', 'general')) NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
    status TEXT CHECK(status IN ('open', 'in-progress', 'resolved')) DEFAULT 'open',
    attachments TEXT, -- JSON array
    response_message TEXT,
    response_admin_id TEXT,
    response_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK(type IN ('info', 'warning', 'emergency', 'promotion')) NOT NULL,
    author_id TEXT NOT NULL,
    target_audience TEXT CHECK(target_audience IN ('all', 'students', 'staff', 'premium')) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    attachments TEXT, -- JSON array
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Recurring bookings table
CREATE TABLE IF NOT EXISTS recurring_bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    day_of_week INTEGER CHECK(day_of_week BETWEEN 0 AND 6) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    start_date DATE NOT NULL,
    end_date DATE,
    session_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Workout buddies table
CREATE TABLE IF NOT EXISTS workout_buddies (
    id TEXT PRIMARY KEY,
    requester_user_id TEXT NOT NULL,
    target_user_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME,
    FOREIGN KEY (requester_user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Billing transactions table for payment history
CREATE TABLE IF NOT EXISTS billing_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    transaction_type TEXT CHECK(transaction_type IN ('payment', 'refund', 'adjustment', 'late_fee')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'SGD',
    payment_method TEXT CHECK(payment_method IN ('credit_card', 'bank_transfer', 'paypal', 'cash', 'waived')) NOT NULL,
    payment_reference TEXT, -- External transaction ID
    description TEXT,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    processed_by TEXT, -- Admin user ID who processed
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_gym_sessions_date ON gym_sessions(date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_session_id ON waitlist(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- Create triggers for updating timestamps
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_sessions_timestamp 
    AFTER UPDATE ON gym_sessions
BEGIN
    UPDATE gym_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_bookings_timestamp 
    AFTER UPDATE ON bookings
BEGIN
    UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 