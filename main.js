/*
    gol - main.js
*/

// ----- init
let settings = {
  'width': 400,
  'height': 400,
  'cell': {
    'x': 40,
    'y': 40,
  },
  'timer': 1000 / 8,
  'cell_size': null,
  'rand_rate': 0.1, // Initial survival rate when randomize
}
let o_map = Array(settings.cell.x + 2).fill().map(
  () => Array(settings.cell.y + 2).fill(0)
);
let ctx, main_disp = null;
let interval_id = null;

// ----- onload
window.onload = () => {
  [ctx, main_disp] = init();
  init_draw();
  event_listen();
};

// ----- func
const init = () => {
  const main_div = document.getElementById('main_div');
  const main_disp = document.createElement('canvas');
  main_disp.width = settings.width;
  main_disp.height = settings.height;
  main_disp.setAttribute('id', 'main_disp');
  const ctx = main_disp.getContext('2d');
  main_div.appendChild(main_disp);

  let cell_size = {
    'x': ctx.canvas.width / settings.cell.x,
    'y': ctx.canvas.height / settings.cell.y,
  }
  settings.cell_size = cell_size;
  return [ctx, main_disp];
}

const event_listen = () => {
  document.getElementById('start_button').addEventListener('click', () => {
    if (interval_id !== null) clearInterval(interval_id);
    main();
    interval_id = setInterval(main, settings.timer);
  });

  document.getElementById('step_button').addEventListener('click', () => {
    if (interval_id !== null) clearInterval(interval_id);
    main();
  });

  document.getElementById('stop_button').addEventListener('click', () => {
    if (interval_id !== null) clearInterval(interval_id);
  });

  document.getElementById('randomize_button').addEventListener('click', () => {
    if (interval_id !== null) clearInterval(interval_id);
    randomize(o_map);
    init_draw();
    draw();
  });

  main_disp.addEventListener('click', e => {
    const rect = e.target.getBoundingClientRect();
    let canvasX = (e.clientX - rect.left)+1,
      canvasY = (e.clientY - rect.top)+1;

    let cell_x = Math.floor(canvasX/settings.cell_size.x)+1,
      cell_y = Math.floor(canvasY/settings.cell_size.y)+1;

    if (interval_id !== null) clearInterval(interval_id);
    o_map[cell_x][cell_y] = (~o_map[cell_x][cell_y])+2;
    // console.log(cell_x, cell_y);
    init_draw();
    draw();
    });
}

const main = () => {
  step();
  init_draw();
  draw();
}

const randomize = (arr) => {
  // console.log(arr.length);
  for (let i = 1; i < arr.length-1; i++) {
    for (let j = 1; j < arr[i].length-1; j++) {
      arr[i][j] = Math.floor(Math.random()/(1-settings.rand_rate));
    }
  }
  // console.log(arr);
}

const step = () =>{
  let g_map = o_map; // game_map <-- old_map
  let cc = 0; // counter
  for (let i = 1; i < settings.cell.x; i++) {
    for (let j = 1; j < settings.cell.y; j++) {
      cc = 0;
      cc += o_map[i - 1][j - 1];
      cc += o_map[i - 1][j];
      cc += o_map[i - 1][j + 1];
      cc += o_map[i][j - 1];
      cc += o_map[i][j + 1];
      cc += o_map[i + 1][j - 1];
      cc += o_map[i + 1][j];
      cc += o_map[i + 1][j + 1];

      /*
        周囲8マスのうち

          [i, j]が生存しているとき
            生存が1以下であれば過疎で死滅
            生存が2,3であれば生存
            生存が4以上で過密となり死滅

          [i, j]が生存していないとき
            生存が3で誕生
          -----
          つまり、周囲の生存が3 または 2かつ[i, j]が生存しているとき、生き残る
      */
      if (cc === 3 || cc === 2 && g_map[i][j]) g_map[i][j] = 1;
      else g_map[i][j] = 0;
    }
  }
  o_map = g_map; // old_map <-- game_map
}

const init_draw = () => {
  ctx.fillStyle = '#555';
  ctx.fillRect(0, 0, 400, 400);
  ctx.beginPath();
  for (let i = 0; i <= settings.cell.x; i++) {
    ctx.moveTo(settings.cell_size.x * i, 0);
    ctx.lineTo(settings.cell_size.x * i, ctx.canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
  }
  for (let i = 0; i <= settings.cell.y; i++) {
    ctx.moveTo(0, settings.cell_size.y * i);
    ctx.lineTo(ctx.canvas.width, settings.cell_size.y * i);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
  }
  ctx.stroke();
}

const draw = () => {
  ctx.fillStyle = '#bbb';
  for (let i = 1; i <= settings.cell.x; i++) {
    for (let j = 1; j <= settings.cell.y; j++) {
      if (o_map[i][j]) {
        ctx.fillRect(
          settings.cell_size.x * (i-1) + 1,
          settings.cell_size.y * (j-1) + 1,
          settings.cell_size.x - 2,
          settings.cell_size.y - 2,
          )
      }
    }
  }
}
