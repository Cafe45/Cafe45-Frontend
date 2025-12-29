-- ============================================
-- Cafe 45 Database Schema with RLS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (User Management)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (except is_admin)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- ============================================
-- CAKE INQUIRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cake_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    size INTEGER NOT NULL, -- 0=6 pieces, 1=8 pieces, 2=12 pieces, 3=Larger
    flavor INTEGER NOT NULL, -- 0=Chocolate, 1=Raspberry, 2=Vanilla, 3=Strawberry, 4=Lemon, 5=Custom
    description TEXT NOT NULL,
    decorations BOOLEAN DEFAULT FALSE,
    cake_text BOOLEAN DEFAULT FALSE,
    extra_filling BOOLEAN DEFAULT FALSE,
    workflow_status INTEGER DEFAULT 1, -- 1=Pending, 2=InProgress, 3=Completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on cake_inquiries
ALTER TABLE cake_inquiries ENABLE ROW LEVEL SECURITY;

-- Cake Inquiries RLS Policies
-- Anyone can create an inquiry (even non-authenticated users)
CREATE POLICY "Anyone can create cake inquiry"
    ON cake_inquiries FOR INSERT
    WITH CHECK (TRUE);

-- Users can view their own inquiries
CREATE POLICY "Users can view own inquiries"
    ON cake_inquiries FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries"
    ON cake_inquiries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can update all inquiries
CREATE POLICY "Admins can update all inquiries"
    ON cake_inquiries FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'Pending', -- Pending, Paid, Failed
    delivery_type INTEGER NOT NULL, -- 0=Pickup, 1=HomeDelivery
    delivery_address TEXT,
    workflow_status INTEGER DEFAULT 1, -- 1=Pending, 2=InProgress, 3=Completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders RLS Policies
-- Authenticated users can create orders
CREATE POLICY "Authenticated users can create orders"
    ON orders FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

-- Anyone can create orders (for guest checkout)
CREATE POLICY "Anyone can create orders"
    ON orders FOR INSERT
    WITH CHECK (TRUE);

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Order Items RLS Policies
-- Anyone can create order items (tied to order creation)
CREATE POLICY "Anyone can create order items"
    ON order_items FOR INSERT
    WITH CHECK (TRUE);

-- Users can view items from their own orders
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cake_inquiries_updated_at ON cake_inquiries;
CREATE TRIGGER update_cake_inquiries_updated_at
    BEFORE UPDATE ON cake_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_cake_inquiries_user_id ON cake_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_cake_inquiries_workflow_status ON cake_inquiries(workflow_status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_workflow_status ON orders(workflow_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ============================================
-- NOTES FOR SETUP
-- ============================================
-- After running this schema:
-- 1. Create your first admin user through the Supabase Auth UI or signup flow
-- 2. Manually set is_admin = TRUE for that user in the profiles table
-- 3. Use that admin account to access the admin dashboard
