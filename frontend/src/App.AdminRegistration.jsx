import { Provider } from 'react-redux';
import store from './store/store';
import AdminRegistration from './components/AdminRegistration';
import './App.css';

function AdminRegistrationPreview() {
  return (
    <Provider store={store}>
      <AdminRegistration />
    </Provider>
  );
}

export default AdminRegistrationPreview;