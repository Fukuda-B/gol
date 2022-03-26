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
  'rand_rate': 0.2, // Initial survival rate when randomize
}
let o_map = Array(settings.cell.x + 2).fill().map(
  () => Array(settings.cell.y + 2).fill(0));
let ctx, main_disp = null;
let interval_id = null;
let logg = {
  'born': 0,
  'dead': 0,
  'surv': 0,
};

// ----- onload
window.onload = () => {
  [ctx, main_disp] = init();
  init_draw();
  event_listen();
  update_stat();
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

const update_stat = () => {
  let stat = document.getElementById('stat');
  stat.innerHTML = '<p>Status</p>'
    +'<p>Born: ' + logg.born
    +'<br>Dead: ' + logg.dead
    +'<br>Survivors: ' + (logg.surv*100/(settings.cell.x*settings.cell.y)).toFixed(2) + '%'
    +'<br>Diff: ' + (logg.born-logg.dead)
    +'<br>-----'
    +'<br>update rate: ' + parseInt(settings.timer) + 'ms'
    +'<br>probability: ' + (parseFloat(settings.rand_rate)).toFixed(2)
    +'</p>';
}

const event_listen = () => {
  let option_timer = document.getElementById('option_timer');
  let option_rand_rate = document.getElementById('option_rand_rate');

  option_timer.addEventListener('input', () => {
    settings.timer = 1000 / option_timer.value;
    update_stat();
    if (interval_id !== null) {
      clearInterval(interval_id);
      main();
      // interval_id = setInterval(main, settings.timer);
    }
  })

  option_rand_rate.addEventListener('input', () => {
    settings.rand_rate = option_rand_rate.value;
    update_stat();
  })

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
    update_stat();
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
    update_stat();
    });
}

const main = () => {
  step();
  init_draw();
  draw();
  update_stat();
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
  let g_map = Array(settings.cell.x + 2).fill().map(
    () => Array(settings.cell.y + 2).fill(0));

  let cc = 0; // cell counter
  logg.born = 0;
  logg.dead = 0;
  for (let i = 1; i <= settings.cell.x; i++) {
    for (let j = 1; j <= settings.cell.y; j++) {
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
      if (cc === 3 || cc === 2 && o_map[i][j]) {
        g_map[i][j] = 1;
        if (o_map[i][j] === 0) logg.born++;
      } else {
        g_map[i][j] = 0;
        if (o_map[i][j] === 1) logg.dead++;
      }
    }
  }
  o_map = g_map; // old_map <-- game_map
}

const init_draw = () => {
  ctx.fillStyle = '#444';
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
  logg.surv = 0;
  for (let i = 1; i <= settings.cell.x; i++) {
    for (let j = 1; j <= settings.cell.y; j++) {
      if (o_map[i][j]) {
        ctx.fillRect(
          settings.cell_size.x * (i-1) + 1,
          settings.cell_size.y * (j-1) + 1,
          settings.cell_size.x - 2,
          settings.cell_size.y - 2,
          )
        logg.surv++;
      }
    }
  }
}
