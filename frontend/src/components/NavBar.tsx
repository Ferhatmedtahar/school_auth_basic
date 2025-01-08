import { Link } from "react-router-dom";
const Navbar = () => {
  const { user, signOut } = {
    user: {
      username: "John Doe",
    },
    signOut: () => {
      console.log("Sign out clicked");
    },
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Checklist App
        </Link>
        <div>
          {user ? (
            <>
              <span className="text-white  mr-4">Welcome, {user.username}</span>
              <Link to="/checklist" className="text-white mr-4">
                My Checklist
              </Link>
              <button onClick={signOut} className="text-white">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-white mr-4">
                Sign In
              </Link>
              <Link to="/signup" className="text-white">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
