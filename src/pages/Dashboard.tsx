import AdminNotificationButton from "../components/AdminNotificationButton";
import NotificationList from "../components/NotificationList";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Normal buttons (events, chat, etc.) */}

      {/* Admin-only button */}
      <AdminNotificationButton />

      {/* User notification list */}
      <NotificationList />
    </div>
  );
}
