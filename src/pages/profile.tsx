import { Profile } from "~/components/profile/Profile";
import { Navbar } from "~/components/layout/Navbar";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Profile />
    </div>
  );
}
