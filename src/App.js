import AppRouter from "components/routing/routers/AppRouter";
import UserContext from "./components/contexts/UserContext";
/**
 * Happy coding!
 * React Template by Lucas Pelloni
 * Overhauled by Kyrill Hux
 */
const App = () => {
  return (
    <div>
        <UserContext>
            <AppRouter/>
        </UserContext>
    </div>
  );
};

export default App;
