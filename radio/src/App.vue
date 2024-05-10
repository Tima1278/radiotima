<template>
  <nav>
    <router-link to="/">Radio</router-link> |
    <router-link to="/favorite">Preferiti</router-link> |
    <router-link to="/posizione_radio">Posizione Radio</router-link>
  </nav>
  <router-view />
</template>

<style>
nav {
  padding: 20px;
  background-color: #f8f9fa; /* Added background color */
  border-bottom: 1px solid #ccc; /* Added border bottom */
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none; /* Removed underline */
  padding: 5px 10px; /* Added padding */
}

nav a:hover {
  color: #42b983;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
