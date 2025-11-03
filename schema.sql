-- ===========================
-- SCHEMA FOR CLUB MANAGEMENT
-- ===========================

-- Drop existing tables to reset database
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS members;

-- ===========================
-- 1. MEMBERS TABLE
-- ===========================
CREATE TABLE members (
    member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    cni TEXT UNIQUE NOT NULL,
    cne TEXT UNIQUE NOT NULL,
    school_level TEXT,
    whatsapp_number TEXT,
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- 2. EVENTS TABLE
-- ===========================
CREATE TABLE events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    event_date DATETIME NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- 3. PARTICIPANTS TABLE
-- ===========================
-- Linking table between members and events
CREATE TABLE participants (
    participant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    attendance_status TEXT CHECK(attendance_status IN ('Present', 'Absent')) DEFAULT 'Absent',
    work_rating INTEGER CHECK(work_rating BETWEEN 0 AND 10),
    points INTEGER DEFAULT 0,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- ===========================
-- OPTIONAL VIEWS OR INDEXES
-- ===========================
-- Example: quick view to see member performance summary
CREATE VIEW IF NOT EXISTS member_points_summary AS
SELECT 
    m.member_id,
    m.full_name,
    SUM(p.points) AS total_points,
    COUNT(DISTINCT p.event_id) AS total_events,
    SUM(CASE WHEN p.attendance_status = 'Present' THEN 1 ELSE 0 END) AS attended_events
FROM members m
LEFT JOIN participants p ON m.member_id = p.member_id
GROUP BY m.member_id;

-- ===========================
-- SAMPLE DATA (optional)
-- ===========================
INSERT INTO members (full_name, cni, cne, school_level, whatsapp_number)
VALUES 
('Abderrahmane El Haimar', 'CNI123456', 'CNE654321', 'University', '+212600000000');

INSERT INTO events (event_name, event_date, description)
VALUES 
('Club Kickoff Meeting', '2025-11-05 10:00:00', 'First meeting of the semester to plan activities.');

INSERT INTO participants (member_id, event_id, attendance_status, work_rating, points)
VALUES 
(1, 1, 'Present', 8, 10);
