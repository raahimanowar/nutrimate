import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />
            <div className="flex-1 ml-72 flex flex-col">
                <DashboardNavbar />
                <main className="flex-1 bg-white overflow-y-auto mt-16"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#f97316 #f5f5f5'
                    }}
                >
                    {/* Content */}
                    <div className="relative p-4 bg-linear-to-br from-orange-50 via-white to-amber-50 min-h-screen ">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
