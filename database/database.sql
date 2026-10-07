CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student'
        CHECK (role IN ('student', 'organizer')),
    department VARCHAR(100),
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS organizations (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    contact_email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS events (
    event_id SERIAL PRIMARY KEY,

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    category VARCHAR(30) NOT NULL
        CHECK (
            category IN (
                'seminar',
                'workshop',
                'competition',
                'sports',
                'cultural',
                'other'
            )
        ),

    event_date DATE NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME,

    venue VARCHAR(200) NOT NULL,

    capacity INTEGER NOT NULL
        CHECK (capacity > 0),

    registration_deadline DATE,

    organizer_id INTEGER NOT NULL,

    organization_id INTEGER,

    image_url VARCHAR(500),

    status VARCHAR(20) DEFAULT 'approved'
        CHECK (
            status IN ('approved', 'completed')
        ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_organizer
        FOREIGN KEY (organizer_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_event_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(organization_id)
        ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS registrations (
    registration_id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    event_id INTEGER NOT NULL,

    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(20) DEFAULT 'registered'
        CHECK (
            status IN ('registered', 'cancelled')
        ),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (event_id)
        REFERENCES events(event_id)
        ON DELETE CASCADE,

    UNIQUE(user_id, event_id)
);


CREATE TABLE IF NOT EXISTS attendance (
    attendance_id SERIAL PRIMARY KEY,

    event_id INTEGER NOT NULL,

    user_id INTEGER NOT NULL,

    attendance_status VARCHAR(20) DEFAULT 'absent'
        CHECK (
            attendance_status IN ('present', 'absent')
        ),

    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES events(event_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    UNIQUE(event_id, user_id)
);


CREATE TABLE IF NOT EXISTS feedback (
    feedback_id SERIAL PRIMARY KEY,

    event_id INTEGER NOT NULL,

    user_id INTEGER NOT NULL,

    rating INTEGER NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES events(event_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    UNIQUE(event_id, user_id)
);


INSERT INTO organizations
(
    name,
    description,
    contact_email
)
SELECT
    'ICT Club',
    'University ICT Club',
    'ictclub@university.com'
WHERE NOT EXISTS (
    SELECT 1
    FROM organizations
    WHERE name = 'ICT Club'
);