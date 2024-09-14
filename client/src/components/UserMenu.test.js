import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import UserMenu from "./UserMenu";
import {MemoryRouter, Routes, Route} from "react-router-dom";

const Profile = () => <div>USER PROFILE</div>;
const Orders = () => <div>All Orders</div>;

describe('User Menu Component', () => {
    it('renders user menu correctly', () => {
        const { getByText } = render(
            <MemoryRouter>
                <UserMenu />
            </MemoryRouter>
        )
        expect(getByText('Dashboard')).toBeInTheDocument();
        expect(getByText('Profile')).toBeInTheDocument();
        expect(getByText('Orders')).toBeInTheDocument();
    });

    it('navigate to profile', () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/usermenu']}>
                <Routes>
                    <Route path="/usermenu" element={<UserMenu />} />
                    <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        )

        fireEvent.click(getByText('Profile'));
        expect(screen.getByText('USER PROFILE')).toBeInTheDocument();
    });

    it('navigate to orders', () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/usermenu']}>
                <Routes>
                    <Route path="/usermenu" element={<UserMenu />} />
                    <Route path="/dashboard/user/orders" element={<Orders />} />
                </Routes>
            </MemoryRouter>
        )

        fireEvent.click(getByText('Orders'));
        expect(screen.getByText('All Orders')).toBeInTheDocument();
    });
});
