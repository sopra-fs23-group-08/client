import AppRouter from "components/routing/routers/AppRouter";
import {UserProvider} from "./components/contexts/UserContext";
/**
 * Happy coding!
 * React Template by Lucas Pelloni
 * Overhauled by Kyrill Hux
 */
const App = () => {
  return (
    <div>
        <UserProvider>
            <AppRouter/>
        </UserProvider>
    </div>
  );
};

export default App;
