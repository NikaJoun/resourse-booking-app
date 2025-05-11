export const getResourceIcon = (type) => {
  switch(type) {
    case 'photographer': return 'bi bi-camera';
    case 'conference_room': return 'bi bi-building';
    case 'equipment': return 'bi bi-pc-display';
    default: return 'bi bi-collection';
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

export const getResourceName = (resourceId, resources) => {
  if (!resources) return 'Неизвестный ресурс';
  const resource = resources.find(r => r.id === resourceId);
  return resource ? resource.name : 'Неизвестный ресурс';
};

export const getUserName = (userId, users) => {
  if (!users) return 'Неизвестный пользователь';
  const user = users.find(u => u.id === userId);
  return user ? user.username : 'Неизвестный пользователь';
};