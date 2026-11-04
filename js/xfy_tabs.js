/*
 * 作者：邢菲洋
 * 建立时间：2026-11-04
 * 使用大模型：GLM-5.3-Flash
 * 功能名称：可复用 Tab 选项卡组件
 * 说明：页面中每个 .xfy_tabs 容器调用 xfy_initTabs 即成为一组独立选项卡
 */

/**
 * 初始化一组选项卡组件（可复用入口）
 * 主要功能：为传入容器内的选项卡按钮绑定点击监听事件（事件委托），
 *          点击后先清除所有选项卡及面板的选中状态，再设置当前项选中。
 * @param {HTMLElement} xfy_wrap - 选项卡组件的容器元素（.xfy_tabs）
 */
function xfy_initTabs(xfy_wrap) {
  // 获取当前组件内的所有选项卡按钮和内容面板
  var xfy_tabs = xfy_wrap.querySelectorAll(".xfy_tab-item");
  var xfy_panels = xfy_wrap.querySelectorAll(".xfy_tab-panel");

  // 监听事件：在选项卡栏上做事件委托，点击任意选项卡按钮触发切换
  xfy_wrap.querySelector(".xfy_tab-bar").addEventListener("click", function (xfy_event) {
    // 从事件目标向上找选项卡按钮，点在空隙处则不处理
    var xfy_current = xfy_event.target.closest(".xfy_tab-item");
    if (!xfy_current) return;

    // 核心切换逻辑：先清除所有选中状态，再设置当前元素选中
    xfy_switchTab(xfy_tabs, xfy_panels, xfy_current);
  });
}

/**
 * 切换选项卡
 * 主要功能：先清除所有选项卡与面板的选中状态，再为当前点击的
 *          选项卡及其对应面板（按 data-xfy-tab 属性匹配）添加选中状态。
 * @param {NodeList} xfy_tabs   - 当前组件内全部选项卡按钮
 * @param {NodeList} xfy_panels - 当前组件内全部内容面板
 * @param {HTMLElement} xfy_current - 当前被点击的选项卡按钮
 */
function xfy_switchTab(xfy_tabs, xfy_panels, xfy_current) {
  // 第一步：先清除所有选项卡的选中状态（同时清除面板选中）
  xfy_clearActive(xfy_tabs, xfy_panels);

  // 第二步：再设置当前元素的选中状态
  xfy_current.classList.add("xfy_active");

  // 按 data-xfy-tab 属性找到对应面板并选中显示
  var xfy_panelId = xfy_current.getAttribute("data-xfy-tab");
  var xfy_panel = document.getElementById(xfy_panelId);
  if (xfy_panel) {
    xfy_panel.classList.add("xfy_active");
  }
}

/**
 * 清除选中状态
 * 主要功能：遍历移除所有选项卡按钮与内容面板上的 xfy_active 选中类。
 * @param {NodeList} xfy_tabs   - 当前组件内全部选项卡按钮
 * @param {NodeList} xfy_panels - 当前组件内全部内容面板
 */
function xfy_clearActive(xfy_tabs, xfy_panels) {
  xfy_tabs.forEach(function (xfy_item) {
    xfy_item.classList.remove("xfy_active");
  });
  xfy_panels.forEach(function (xfy_panel) {
    xfy_panel.classList.remove("xfy_active");
  });
}

// 页面加载完成后，初始化页面上所有选项卡组件（每组自动复用同一套逻辑）
document.querySelectorAll(".xfy_tabs").forEach(xfy_initTabs);
