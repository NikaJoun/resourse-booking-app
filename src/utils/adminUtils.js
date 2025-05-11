import { computed } from 'vue';

export const useUserFilters = (users, searchQuery, roleFilter) => {
  return computed(() => {
    return users.value.filter(user => {
      const matchesSearch = user.username.toLowerCase()
        .includes(searchQuery.value.toLowerCase());
      const matchesRole = roleFilter.value 
        ? user.role === roleFilter.value 
        : true;
      return matchesSearch && matchesRole;
    });
  });
};

export const useResourceFilters = (resources, searchQuery, typeFilter, managerFilter) => {
  return computed(() => {
    return resources.value.filter(resource => {
      const matchesSearch = resource.name.toLowerCase()
        .includes(searchQuery.value.toLowerCase());
      const matchesType = typeFilter.value 
        ? resource.type === typeFilter.value 
        : true;
        const matchesManager = managerFilter.value 
        ? (resource.managerId !== null && resource.managerId === Number(managerFilter.value))
        : true;
      return matchesSearch && matchesType && matchesManager;
    });
  });
};