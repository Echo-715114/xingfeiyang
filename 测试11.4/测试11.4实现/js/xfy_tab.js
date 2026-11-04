/*
 * 作者：邢菲洋
 * 建立时间：2026-11-04
 * 使用大模型：GLM-5.3-Flash
 * 功能名称：视频TOP10排行榜选项卡交互
 * 说明：先清除所有选项卡的选中状态，再设置当前元素的选中状态
 */

/**
 * 初始化选项卡（可复用入口）
 * 主要功能：为排行卡片的选项卡栏绑定点击监听事件（事件委托），
 *          点击后先清除全部选中，再设置当前选项卡与对应面板选中。
 * @param {HTMLElement} xfy_wrap - 排行卡片容器元素（.xfy_top10）
 */
function xfy_initTabs(xfy_wrap) {
  var xfy_tabs = xfy_wrap.querySelectorAll(".xfy_tab-item");
  var xfy_panels = xfy_wrap.querySelectorAll(".xfy_tab-panel");

  // 监听事件：在选项卡栏上做事件委托，点击任意选项卡触发切换
  xfy_wrap.querySelector(".xfy_tab-bar").addEventListener("click", function (xfy_event) {
    var xfy_current = xfy_event.target.closest(".xfy_tab-item");
    if (!xfy_current) return; // 点在空隙处不处理

    // 切换：先清除所有选中状态，再设置当前元素选中
    xfy_switchTab(xfy_tabs, xfy_panels, xfy_current);
  });
}

/**
 * 切换选项卡
 * 主要功能：第一步调用 xfy_clearActive 清除所有选项卡与面板的选中状态；
 *          第二步为当前点击的选项卡添加选中，并按 data-xfy-tab
 *          属性找到对应榜单面板显示。
 * @param {NodeList} xfy_tabs   - 全部选项卡按钮
 * @param {NodeList} xfy_panels - 全部榜单面板
 * @param {HTMLElement} xfy_current - 当前被点击的选项卡按钮
 */
function xfy_switchTab(xfy_tabs, xfy_panels, xfy_current) {
  // 第一步：先清除所有选项卡的选中状态（含面板）
  xfy_clearActive(xfy_tabs, xfy_panels);

  // 第二步：再设置当前元素的选中状态
  xfy_current.classList.add("xfy_active");
  var xfy_panel = document.getElementById(xfy_current.getAttribute("data-xfy-tab"));
  if (xfy_panel) {
    xfy_panel.classList.add("xfy_active");
  }
}

/**
 * 清除选中状态
 * 主要功能：遍历移除所有选项卡按钮与榜单面板上的 xfy_active 选中类。
 * @param {NodeList} xfy_tabs   - 全部选项卡按钮
 * @param {NodeList} xfy_panels - 全部榜单面板
 */
function xfy_clearActive(xfy_tabs, xfy_panels) {
  xfy_tabs.forEach(function (xfy_item) {
    xfy_item.classList.remove("xfy_active");
  });
  xfy_panels.forEach(function (xfy_panel) {
    xfy_panel.classList.remove("xfy_active");
  });
}

// 页面加载后初始化排行卡片选项卡
document.querySelectorAll(".xfy_top10").forEach(xfy_initTabs);
