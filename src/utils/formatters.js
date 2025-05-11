export const formatRole = (role) => {
  switch(role) {
    case 'user': return 'Пользователь';
    case 'manager': return 'Менеджер';
    case 'admin': return 'Администратор';
    default: return role;
  }
};

export const formatResourceType = (type) => {
  switch(type) {
    case 'photographer': return 'Фотограф';
    case 'conference_room': return 'Конференц-зал';
    case 'equipment': return 'Оборудование';
    default: return type;
  }
};

export const getResourceIcon = (type) => {
  switch(type) {
    case 'photographer': return 'bi bi-camera';
    case 'conference_room': return 'bi bi-building';
    case 'equipment': return 'bi bi-pc-display';
    default: return 'bi bi-collection';
  }
};