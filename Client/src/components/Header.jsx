import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
	Bars3Icon,
	XMarkIcon,
	ArrowRightOnRectangleIcon,
	ArrowLeftOnRectangleIcon,
	UserPlusIcon,
	PhotoIcon,
	UsersIcon,
	CalendarIcon,
	CloudArrowUpIcon,
	Squares2X2Icon,
} from '@heroicons/react/24/outline';

const Header = () => {
	const { isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const handleLinkClick = () => {
		setMenuOpen(false); // Close menu on link click (mobile)
	};

	const navItemClass =
		'flex items-center text-gray-200 hover:text-blue-300 font-medium transition !no-underline';

	return (
		<header className='sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 shadow-lg border-b border-blue-500/30'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center py-2'>

					{/* Brand */}
					<Link
						to='/'
						onClick={handleLinkClick}
						className='flex items-center gap-2 !no-underline text-blue-300 text-2xl font-bold hover:scale-105 transform transition'
						aria-label='Home'>
						<PhotoIcon className='w-7 h-6' />
						Post Generator
					</Link>

					{/* Mobile Toggle */}
					<button
						className='md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition'
						onClick={() => setMenuOpen(prev => !prev)}
						aria-label='Toggle navigation'>
						{menuOpen ? (
							<XMarkIcon className='w-8 h-8 text-blue-300' />
						) : (
							<Bars3Icon className='w-8 h-8 text-blue-300' />
						)}
					</button>

					{/* Navigation Items */}
					<div
						className={`${
							menuOpen ? 'block bg-gradient-to-br from-slate-800/95 via-blue-900/80 to-slate-700/95' : 'hidden'
						} absolute md:relative top-16 md:top-0 mt-2 left-0 w-full md:w-auto md:bg-transparent shadow-lg md:shadow-none rounded-b-lg md:rounded-none md:flex md:items-center z-40 border-t border-blue-500/30 md:border-none`}>
						<ul className='flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 p-4 md:p-0 w-full md:w-auto'>
							{isAuthenticated && (
								<>
									<li>
										<Link to='/dashboard' className={navItemClass} onClick={handleLinkClick}>
											<Squares2X2Icon className='w-5 h-5 mr-1' />
											Dashboard
										</Link>
									</li>
									<li>
										<Link to='/schedule-list
										' className={navItemClass} onClick={handleLinkClick}>
											<Squares2X2Icon className='w-5 h-5 mr-1' />
											schedule-list
										</Link>
									</li>
									<li>
										<Link to='/posterList' className={navItemClass} onClick={handleLinkClick}>
											<PhotoIcon className='w-5 h-5 mr-1' />
											Posters
										</Link>
									</li>
									<li>
										<Link to='/customers-list' className={navItemClass} onClick={handleLinkClick}>
											<UsersIcon className='w-5 h-5 mr-1' />
											Customers List
										</Link>
									</li>
									<li>
										<Link to='/customers' className={navItemClass} onClick={handleLinkClick}>
											<UserPlusIcon className='w-5 h-5 mr-1' />
											Add Customer
										</Link>
									</li>
									<li>
										<Link to='/upload' className={navItemClass} onClick={handleLinkClick}>
											<CloudArrowUpIcon className='w-5 h-5 mr-1' />
											Upload Poster
										</Link>
									</li>
									<li>
										<Link to='/schedule' className={navItemClass} onClick={handleLinkClick}>
											<CalendarIcon className='w-5 h-5 mr-1' />
											Schedule
										</Link>
										<Link to='/profile' className={navItemClass} onClick={handleLinkClick}>
											<CalendarIcon className='w-5 h-5 mr-1' />
											Profile
										</Link>
									</li>
								</>
							)}
						</ul>

						{/* Auth Buttons */}
						<div className='flex flex-col md:flex-row gap-2 md:gap-4 p-4 md:p-0 w-full md:w-auto'>
							{!isAuthenticated ? (
								<>
									<Link
										to='/login'
										onClick={handleLinkClick}
										className='w-full md:w-auto px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-1'>
										<ArrowRightOnRectangleIcon className='w-5 h-5' />
										Sign In
									</Link>
									<Link
										to='/register'
										onClick={handleLinkClick}
										className='w-full md:w-auto px-4 py-2 text-sm bg-slate-800/50 text-blue-300 border border-blue-400/30 rounded-lg shadow-lg hover:bg-slate-700/50 transition flex items-center justify-center gap-1'>
										<UserPlusIcon className='w-5 h-5' />
										Sign Up
									</Link>
								</>
							) : (
								<button
									onClick={() => {
										handleLinkClick();
										handleLogout();
									}}
									className='w-full md:w-auto px-4 py-2 text-sm bg-red-500/20 text-red-300 border border-red-400/30 rounded hover:bg-red-500/30 transition flex items-center justify-center gap-1'>
									<ArrowLeftOnRectangleIcon className='w-5 h-5' />
									Logout
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
