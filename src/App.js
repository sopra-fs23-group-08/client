import AppRouter from "components/routing/routers/AppRouter";
import {UserProvider} from "./components/contexts/UserContext";
import {StompProvider} from "./components/contexts/StompContext";
/**
 * Happy coding!
 * React Template by Lucas Pelloni
 * Overhauled by Kyrill Hux
 */
const App = () => {
  return (
    <div>
        <UserProvider>
            <StompProvider>
                <AppRouter/>
            </StompProvider>
        </UserProvider>
    </div>
  );
};

export default App;
