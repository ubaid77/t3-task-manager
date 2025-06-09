import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SignOutButton } from "~/components/auth/SignOutButton";
import Link from "next/link";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                EasySLR
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="/projects" className="text-gray-700 hover:text-gray-900">
              Projects
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-gray-900">
              Profile
            </Link>
            {session?.user && (
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <span className="text-sm font-medium text-gray-700">
                      {session.user.name}
                    </span>
                  </button>
                </div>
              </div>
            )}
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
