-- Create schema
CREATE SCHEMA dairy_distribution;
SET search_path TO dairy_distribution;

-- Reference table: TimeSlot
CREATE TABLE TimeSlot (
    time_slot_id SERIAL PRIMARY KEY,
    slot_start TIME NOT NULL,
    slot_end TIME NOT NULL,
    description VARCHAR(50),
    CONSTRAINT chk_time_slot CHECK (slot_end > slot_start)
);

-- Reference table: OrderStatus
CREATE TABLE OrderStatus (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(20) UNIQUE NOT NULL,
    description TEXT
);

-- Reference table: PaymentStatus
CREATE TABLE PaymentStatus (
    payment_status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(20) UNIQUE NOT NULL,
    description TEXT
);

-- Reference table: PaymentMode
CREATE TABLE PaymentMode (
    payment_mode_id SERIAL PRIMARY KEY,
    mode_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Address table (Amazon-style)
CREATE TABLE Address (
    address_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^[0-9]{6}$'),
    flat_house VARCHAR(100) NOT NULL,
    area_street VARCHAR(100) NOT NULL,
    landmark VARCHAR(100),
    town_city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'India',
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    delivery_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer table
CREATE TABLE Customer (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    billing_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CustomerAddress junction table
CREATE TABLE CustomerAddress (
    customer_address_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES Customer(customer_id),
    address_id INT REFERENCES Address(address_id),
    time_slot_id INT REFERENCES TimeSlot(time_slot_id),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_customer_address UNIQUE (customer_id, address_id)
);

-- Dairy table
CREATE TABLE Dairy (
    dairy_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address_id INT REFERENCES Address(address_id),
    owner_name VARCHAR(100) NOT NULL,
    manager_name VARCHAR(100) NOT NULL,
    manager_phone VARCHAR(15) NOT NULL,
    manager_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MilkType table
CREATE TABLE MilkType (
    milk_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- DairyMilkOffering table (current offerings)
CREATE TABLE DairyMilkOffering (
    offering_id SERIAL PRIMARY KEY,
    dairy_id INT REFERENCES Dairy(dairy_id),
    milk_type_id INT REFERENCES MilkType(milk_type_id),
    price_per_liter DECIMAL(10,2) NOT NULL,
    capacity_liters DECIMAL(10,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_dairy_milk UNIQUE (dairy_id, milk_type_id),
    CONSTRAINT chk_price_positive CHECK (price_per_liter > 0),
    CONSTRAINT chk_capacity_positive CHECK (capacity_liters >= 0)
);

-- DairyMilkOfferingHistory table
CREATE TABLE DairyMilkOfferingHistory (
    history_id SERIAL PRIMARY KEY,
    offering_id INT REFERENCES DairyMilkOffering(offering_id),
    price_per_liter DECIMAL(10,2) NOT NULL,
    capacity_liters DECIMAL(10,2) NOT NULL,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP,
    CONSTRAINT chk_history_dates CHECK (valid_to IS NULL OR valid_to > valid_from)
);

-- Route table
CREATE TABLE Route (
    route_id SERIAL PRIMARY KEY,
    start_latitude DECIMAL(9,6) NOT NULL,
    start_longitude DECIMAL(9,6) NOT NULL,
    end_latitude DECIMAL(9,6) NOT NULL,
    end_longitude DECIMAL(9,6) NOT NULL,
    route_data TEXT NOT NULL, -- JSON or URL for Google Maps route
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_route UNIQUE (start_latitude, start_longitude, end_latitude, end_longitude)
);

-- Order table
CREATE TABLE "Order" (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES Customer(customer_id),
    dairy_id INT REFERENCES Dairy(dairy_id),
    milk_type_id INT REFERENCES MilkType(milk_type_id),
    volume_liters DECIMAL(10,2) NOT NULL,
    delivery_address_id INT REFERENCES Address(address_id),
    time_slot_id INT REFERENCES TimeSlot(time_slot_id),
    delivery_date DATE NOT NULL,
    status_id INT REFERENCES OrderStatus(status_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES Customer(customer_id), -- NULL if created by dairy
    CONSTRAINT chk_volume_positive CHECK (volume_liters > 0)
);

-- OrderSchedule table
CREATE TABLE OrderSchedule (
    schedule_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES "Order"(order_id),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('WEEKLY', 'MONTHLY')),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('WEEKLY', 'MONTHLY')),
    start_date DATE NOT NULL,
    end_date DATE,
    CONSTRAINT chk_schedule_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- DeliveryBoy table
CREATE TABLE DeliveryBoy (
    delivery_boy_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    uidai_number VARCHAR(12) UNIQUE NOT NULL,
    bank_account_number VARCHAR(30) NOT NULL,
    wage_per_delivery DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_wage_positive CHECK (wage_per_delivery >= 0)
);

-- DeliveryAssignment table
CREATE TABLE DeliveryAssignment (
    assignment_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES "Order"(order_id),
    delivery_boy_id INT REFERENCES DeliveryBoy(delivery_boy_id),
    route_id INT REFERENCES Route(route_id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_time TIMESTAMP,
    CONSTRAINT unique_order_assignment UNIQUE (order_id)
);

-- Payment table
CREATE TABLE Payment (
    payment_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES "Order"(order_id),
    amount DECIMAL(10,2) NOT NULL,
    payment_status_id INT REFERENCES PaymentStatus(payment_status_id),
    payment_mode_id INT REFERENCES PaymentMode(payment_mode_id),
    payment_reference_number VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_amount_positive CHECK (amount > 0)
);

-- Indexes for performance
CREATE INDEX idx_customer_phone ON Customer(phone_number);
CREATE INDEX idx_address_pincode ON Address(pincode);
CREATE INDEX idx_customer_address_customer_id ON CustomerAddress(customer_id);
CREATE INDEX idx_dairy_address_id ON Dairy(address_id);
CREATE INDEX idx_dairy_milk_offering_dairy_id ON DairyMilkOffering(dairy_id);
CREATE INDEX idx_route_coords ON Route(start_latitude, start_longitude, end_latitude, end_longitude);
CREATE INDEX idx_order_customer_id ON "Order"(customer_id);
CREATE INDEX idx_order_dairy_id ON "Order"(dairy_id);
CREATE INDEX idx_order_delivery_date ON "Order"(delivery_date);
CREATE INDEX idx_delivery_assignment_order_id ON DeliveryAssignment(order_id);
CREATE INDEX idx_payment_order_id ON Payment(order_id);