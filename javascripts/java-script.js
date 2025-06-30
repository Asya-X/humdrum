document.addEventListener("DOMContentLoaded", function () {
  // кэширование DOM-элементов
  const cursor = document.getElementById("custom_cursor");
  const body = document.body;
  const header = document.querySelector(".header");
  const arrow = document.getElementById("toggle_arrow");
  const footer = document.querySelector(".footer");
  const footer_arrow = document.getElementById("footer_arrow");
  
  // кэширование селекторов
  const hover_targets = document.querySelectorAll("a, button, .tab, .navigation_link, .slide_card");
  const slide_cards = document.querySelectorAll('.slide_card');
  const tabs = document.querySelectorAll('.tab');
  const products_sections = document.querySelectorAll('.products_section');
  const items = document.querySelectorAll('.item');
  const event_tabs = document.querySelectorAll('.event_tab');
  const event_sections = document.querySelectorAll('.event_section');
  
  // константы
  const gradient_pink = "radial-gradient(circle at center, rgba(255, 255, 0, 0.8), transparent 70%)";
  const gradient_yellow = "radial-gradient(circle at center, rgba(255, 0, 214, 0.8), transparent 70%)";
  const max_pull = 20;
  const hidden_offset = 14;
  
  // состояние
  let is_dragging_header = false;
  let start_y = null;
  let current_translate_y = -hidden_offset;
  
  // кастомный курсор
  body.classList.add("force_hide_cursor");
  document.addEventListener("mousemove", e => {
    if (cursor) {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    }
    body.classList.add("force_hide_cursor");
  });
  
  // hover эффекты для курсора
  hover_targets.forEach(target => {
    target.addEventListener("mouseenter", () => {
      if (cursor) cursor.style.background = gradient_yellow;
      body.classList.add("force_hide_cursor");
    });
    target.addEventListener("mouseleave", () => {
      if (cursor) cursor.style.background = gradient_pink;
      body.classList.add("force_hide_cursor");
    });
  });
  
  // drag функциональность для хедера
  function start_drag(e) {
    is_dragging_header = true;
    start_y = e.touches?.[0]?.clientY || e.clientY;
    if (header) header.style.transition = "none";
    if (arrow) arrow.style.cursor = "grabbing";
    body.classList.add("force_hide_cursor");
  }
  
  function on_move(e) {
    if (!is_dragging_header) return;
    body.classList.add("force_hide_cursor");
    const client_y = e.touches?.[0]?.clientY || e.clientY;
    const delta_y = client_y - start_y;
    const px_to_vw = (px) => (px / window.innerWidth) * 100;
    const pull_amount = Math.min(px_to_vw(delta_y), max_pull);
    const new_translate_y = Math.max(-hidden_offset, Math.min(0, -hidden_offset + pull_amount));
    current_translate_y = new_translate_y;
    if (header) header.style.transform = `translateY(${current_translate_y}vw)`;
  }
  
  function end_drag() {
    is_dragging_header = false;
    if (header) header.style.transition = "transform 0.6s ease";
    if (arrow) arrow.style.cursor = "grab";
    body.classList.add("force_hide_cursor");
  }
  
  if (arrow) {
    arrow.addEventListener("mousedown", start_drag);
    arrow.addEventListener("touchstart", start_drag, { passive: false });
  }
  document.addEventListener("mousemove", on_move);
  document.addEventListener("mouseup", end_drag);
  document.addEventListener("touchmove", on_move, { passive: false });
  document.addEventListener("touchend", end_drag);
  
  // drag функциональность для карточек
  slide_cards.forEach(panel => {
    const is_right = panel.classList.contains('right');
    const is_left = panel.classList.contains('left');
    let is_dragging_card = false;
    let start_x = 0;
    let start_y = 0;
    let start_transform_x = 0;
    let start_transform_y = 0;
    
    function get_translate_x() {
      const style = window.getComputedStyle(panel);
      const matrix = new WebKitCSSMatrix(style.transform);
      return matrix.m41;
    }
    
    function get_translate_y() {
      const style = window.getComputedStyle(panel);
      const matrix = new WebKitCSSMatrix(style.transform);
      return matrix.m42;
    }
    
    function on_move_card(e) {
      if (!is_dragging_card) return;
      e.preventDefault(); 
      body.classList.add("force_hide_cursor");
      const client_x = e.touches?.[0]?.clientX || e.clientX;
      const client_y = e.touches?.[0]?.clientY || e.clientY;
      const delta_x = client_x - start_x;
      const delta_y = client_y - start_y;
      let new_x = start_transform_x + delta_x;
      let new_y = start_transform_y + delta_y;
      const max_offset_x = (85 * window.innerWidth) / 100;
      const max_offset_y = (60 * window.innerHeight) / 100; 
      
      if (is_right) {
        new_x = Math.max(0, Math.min(max_offset_x, new_x));
      } else if (is_left) {
        new_x = Math.max(-max_offset_x, Math.min(0, new_x));
      }
      new_y = Math.max(-max_offset_y, Math.min(max_offset_y, new_y));
      panel.style.transform = `translateX(${new_x}px) translateY(${new_y}px)`;
    }
    
    function end_drag_card(e) {
      if (!is_dragging_card) return;
      is_dragging_card = false;
      panel.style.transition = 'transform 0.4s ease';
      body.classList.add("force_hide_cursor");
      document.removeEventListener("mousemove", on_move_card);
      document.removeEventListener("mouseup", end_drag_card);
      document.removeEventListener("touchmove", on_move_card);
      document.removeEventListener("touchend", end_drag_card);
    }
    
    function start_drag_card(e) {
      e.preventDefault(); 
      e.stopPropagation(); 
      is_dragging_card = true;
      start_x = e.touches?.[0]?.clientX || e.clientX;
      start_y = e.touches?.[0]?.clientY || e.clientY;
      start_transform_x = get_translate_x();
      start_transform_y = get_translate_y();
      panel.style.transition = 'none';
      body.classList.add("force_hide_cursor");
      document.addEventListener("mousemove", on_move_card);
      document.addEventListener("mouseup", end_drag_card);
      document.addEventListener("touchmove", on_move_card, { passive: false });
      document.addEventListener("touchend", end_drag_card);
    }
    
    panel.addEventListener("mousedown", start_drag_card);
    panel.addEventListener("touchstart", start_drag_card, { passive: false });
  });
  
  // функциональность табов
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const target_id = tab.getAttribute('data-target');
      products_sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
      });
      
      if (target_id) {
        const target_section = document.getElementById(target_id);
        if (target_section) {
          if (!target_section.classList.contains('active')) {
            target_section.classList.add('active');
            target_section.style.display = 'flex';
          } else {
            target_section.classList.remove('active');
            target_section.style.display = 'none';
          }
        }
      }
    });
  });
  
  // функциональность элементов меню
  items.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });
  
  // функциональность футера
  if (footer && footer_arrow) {
    let is_dragging_footer = false;
    let start_y = 0;
    let start_translate_y = 0;
    const footer_height = footer.offsetHeight;
    const visible_part = 0.15 * footer_height;
    
    function get_translate_y() {
      const style = window.getComputedStyle(footer);
      const matrix = new DOMMatrix(style.transform);
      return matrix.m42;
    }
    
    function start_drag_footer(e) {
      is_dragging_footer = true;
      start_y = e.clientY || e.touches?.[0]?.clientY;
      start_translate_y = get_translate_y();
      footer.style.transition = "none";
      footer_arrow.style.cursor = "grabbing";
    }
    
    function on_move_footer(e) {
      if (!is_dragging_footer) return;
      const client_y = e.clientY || e.touches?.[0]?.clientY;
      const delta_y = client_y - start_y;
      let new_translate_y = start_translate_y + delta_y;
      new_translate_y = Math.min(0, Math.max(new_translate_y, -(footer_height - visible_part)));
      footer.style.transform = `translateY(${new_translate_y}px)`;
    }
    
    function end_drag_footer() {
      is_dragging_footer = false;
      footer.style.transition = "transform 0.6s ease";
      footer_arrow.style.cursor = "grab";
      const current_translate = get_translate_y();
      const threshold = -(footer_height / 2);
      
      if (current_translate > threshold) {
        footer.style.transform = `translateY(${-footer_height + visible_part}px)`;
        footer_arrow.classList.remove("open");
      } else {
        footer.style.transform = "translateY(0)";
        footer_arrow.classList.add("open");
      }
    }
    
    footer.style.transform = `translateY(${-footer_height + visible_part}px)`;
    footer_arrow.addEventListener("mousedown", start_drag_footer);
    document.addEventListener("mousemove", on_move_footer);
    document.addEventListener("mouseup", end_drag_footer);
    footer_arrow.addEventListener("touchstart", start_drag_footer, { passive: false });
    document.addEventListener("touchmove", on_move_footer, { passive: false });
    document.addEventListener("touchend", end_drag_footer);
  }
  
  // функциональность событий
  event_tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      event_tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      event_sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
      });
      
      const target_id = tab.getAttribute('data-target');
      if (target_id) {
        const target_section = document.getElementById(target_id);
        if (target_section) {
          target_section.classList.add('active');
          target_section.style.display = 'flex';
        }
      }
    });
  });
  
});
