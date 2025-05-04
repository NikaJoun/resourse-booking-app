import { createStore } from 'vuex';
import auth from './modules/auth';
import users from './modules/users';
import resources from './modules/resources';
import bookings from './modules/bookings';
import messages from './modules/messages';
import notifications from './modules/notifications';
import settings from './modules/settings';

export default createStore({
  modules: {
    auth,
    users,
    resources,
    bookings,
    messages,
    notifications,
    settings,
  },
});