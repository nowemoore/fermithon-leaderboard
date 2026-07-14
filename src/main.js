import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'

// Font Awesome (SVG + Vue component — tree-shaken, no webfont needed).
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faSkull,
  faStar,
  faGear,
  faPlay,
  faPause,
  faRotateLeft,
  faXmark,
  faTrash,
  faUpRightFromSquare,
  faLock,
  faTriangleExclamation,
  faTrophy,
  faTableCells,
  faKey,
  faClockRotateLeft,
  faCircleChevronDown,
  faClock,
  faDownload,
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faSkull,
  faStar,
  faGear,
  faPlay,
  faPause,
  faRotateLeft,
  faXmark,
  faTrash,
  faUpRightFromSquare,
  faLock,
  faTriangleExclamation,
  faTrophy,
  faTableCells,
  faKey,
  faClockRotateLeft,
  faCircleChevronDown,
  faClock,
  faDownload
)

createApp(App).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
