/**
 * example 入口
 *
 * 引入 air-design 样式 + Demo 自身样式。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import 'air-design/style.css'
import 'air-sdk/style.css'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </React.StrictMode>
)
