import { useRouter } from 'next/router';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { signOut } from 'next-auth/react';
import Notifications from './Notifications';

const userNavigation = [
    { name: '내 프로필', route: '/Profile' },
    { name: '로그아웃', route: '/auth/signout' },
]

const navigation = [
    { name: '홈', route: '/Home', style: 'text-gray-300 hover:bg-green-700 hover:text-white' },
    { name: '레시피 만들기', route: '/CreateRecipe', style: 'bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-all animate-pulse' },
    { name: '소개', route: '/', style: 'text-gray-300 hover:bg-green-700 hover:text-white' },
]


function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

interface HeaderProps {
    user: {
        name?: string | null | undefined
        image?: string | null | undefined
        email?: string | null | undefined
    } | undefined
}

function Header({ user }: HeaderProps) {

    const router = useRouter();

    const handleNavigation = (menu: { name: string, route: string }) => {
        if (menu.name === 'Sign out') {
            signOut()
            return
        }
        if (menu.name === 'About') {
            window.open('https://github.com/parksanggeon/smart-recipe-generator', '_blank');
        }
        router.push(menu.route)
    }

    if (!user) return null;
    return (
        <Disclosure as="nav" className="sticky top-0 z-50 bg-green-800 shadow-md" style={{ scrollbarGutter: 'stable' }}>
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-white">
                                    <Image
                                        src="/favicon.ico"
                                        alt="logo"
                                        width={62}
                                        height={62}
                                        priority
                                    />
                                </div>
                                <div className="hidden md:block">
                                    <div className="ml-10 flex items-baseline space-x-4">
                                        {navigation.map((item) => (
                                            <button
                                                key={item.name}
                                                className={classNames(
                                                    item.route === router.pathname
                                                        ? 'bg-green-50 text-gray-800'
                                                        : item.style,
                                                    'rounded-md px-3 py-2 text-sm font-medium',
                                                )}
                                                aria-current={item.route === router.pathname ? 'page' : undefined}
                                                onClick={() => handleNavigation(item)}
                                            >
                                                {item.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-4 flex items-center md:ml-6">
                                    <Notifications />
                                    {/* Buy Me a Coffee Button */}
                                    <a
                                        href="https://www.buymeacoffee.com/dereje"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-4 bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
                                    >
                                        ☕ 커피 한 잔 부탁해요
                                    </a>
                                    {/* Profile dropdown */}
                                    <Menu as="div" className="relative ml-3">
                                        <div>
                                            <MenuButton className="relative flex max-w-xs items-center rounded-full bg-green-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-800">
                                                <span className="absolute -inset-1.5" />
                                                <span className="sr-only">Open user menu</span>
                                                <Image
                                                    src={user?.image || ''}
                                                    alt=""
                                                    width={75}
                                                    height={75}
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            </MenuButton>
                                        </div>
                                        <MenuItems
                                            transition
                                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                        >
                                            {userNavigation.map((item) => (
                                                <MenuItem key={item.name}>
                                                    {({ focus }) => (
                                                        <button
                                                            className={classNames(
                                                                focus ? 'bg-gray-100' : '',
                                                                'block px-4 py-2 text-sm text-gray-700 w-full text-left',
                                                            )}
                                                            onClick={() => handleNavigation(item)}
                                                        >
                                                            {item.name}
                                                        </button>
                                                    )}
                                                </MenuItem>
                                            ))}
                                        </MenuItems>
                                    </Menu>
                                </div>
                            </div>
                            <div className="-mr-2 flex md:hidden">
                                {/* Mobile menu button */}
                                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md bg-green-800 p-2 text-gray-200 hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-800">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </DisclosureButton>
                            </div>
                        </div>
                    </div>

                    <DisclosurePanel className="md:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                            {navigation.map((item) => (
                                <DisclosureButton
                                    key={item.name}
                                    className={classNames(
                                        item.route === router.pathname ? 'bg-green-50 text-gray-800' : item.style,
                                        'block rounded-md px-3 py-2 text-base font-medium',
                                    )}
                                    aria-current={item.route === router.pathname ? 'page' : undefined}
                                    onClick={() => handleNavigation(item)}
                                >
                                    {item.name}
                                </DisclosureButton>
                            ))}
                        </div>
                        {/* ☕ Buy Me a Coffee – mobile */}
                        <div className="px-2 pb-3">
                            <a
                                href="https://www.buymeacoffee.com/dereje"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-amber-500 text-white font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
                            >
                                ☕ 커피 한 잔 부탁해요
                            </a>
                        </div>
                        <div className="border-t border-green-700 pb-3 pt-4">
                            <div className="flex items-center px-5">
                                <div className="flex-shrink-0">
                                    <Image
                                        src={user?.image || ''}
                                        alt=""
                                        width={75}
                                        height={75}
                                        className="h-10 w-10 rounded-full"
                                    />
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium leading-none text-white">{user?.name}</div>
                                    <div className="text-sm font-medium leading-none text-gray-300">{user?.email}</div>
                                </div>
                                {/* Push Notifications button to the right */}
                                <div className="ml-auto">
                                    <Notifications screen="mobile" />
                                </div>
                            </div>
                            <div className="mt-3 space-y-1 px-2">
                                {userNavigation.map((item) => (
                                    <DisclosureButton
                                        key={item.name}
                                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-green-700 hover:text-white"
                                        onClick={() => handleNavigation(item)}
                                    >
                                        {item.name}
                                    </DisclosureButton>
                                ))}
                            </div>
                        </div>
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    )
}

export default Header