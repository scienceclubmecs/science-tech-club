import NavBar from "./NavBar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-bgDark text-white flex flex-col">
      <NavBar />
      <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      <footer className="border-t border-gray-700 text-xs text-gray-400 px-4 py-3">
        Science & Tech Club • Built by Developers team
      </footer>
    </div>
  );
};

export default Layout;
