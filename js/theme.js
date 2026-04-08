// theme.js — apply dark/light theme BEFORE page renders (prevents flash)
// Place as FIRST script in <head> on every page
(function(){
  var t = localStorage.getItem('edumytheme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();
