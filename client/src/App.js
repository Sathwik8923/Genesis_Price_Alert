import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from './Navigation';
import Searching from './Searching';
import Login from './Login';

const App = () => {
  return (
    <>
      <Navigation/>
      <Searching/>
      <Login/>
    </>
  );
}

export default App;