module.exports.server=function(serv) {
  serv.tickCount = 0;
  serv.lastTickTime = 0;


  serv.setTickInterval = ticksPerSecond => {
    serv.stopTickInterval();

    serv.tickInterval = setInterval(() => {
      serv.tickCount++;
      var time = (Date.now() - serv.lastTickTime) / 1000;
      if (time > 100) time = 0;
      serv.emit('tick', time, serv.tickCount);
      serv.lastTickTime = Date.now();
    }, 1000/ticksPerSecond);
  };

  serv.stopTickInterval = () => {
    if (serv.tickInterval) clearInterval(serv.tickInterval);
    serv.tickInterval = null;
  };


  serv.setTickInterval(20);
};

