var moment=require("moment");
var rp=require("request-promise");
var nodeUuid=require('node-uuid');

module.exports.server=function(serv)
{

  serv.ban = (uuid, reason) => {
    serv.bannedPlayers[uuid] = {
      time: +moment(),
      reason: reason || "You are banned!"
    };
  };

  function uuidInParts(plainUUID)
  {
    return nodeUuid.unparse(nodeUuid.parse(plainUUID));
  }

  serv.getUUIDFromUsername =  username => {
    return rp('https://api.mojang.com/users/profiles/minecraft/' + username)
      .then((body) => {
        if(!body) throw new Error("username not found");
        return uuidInParts(JSON.parse(body).id)
      })
      .catch(err => {throw new Error("username not found");});
  };

  serv.banUsername = (username, reason, cb) => {
    return serv.getUUIDFromUsername(username)
      .then(uuid => serv.ban(uuid, reason));
  };

  serv.pardonUsername = (username, cb) => {
    return serv.getUUIDFromUsername(username)
      .then(pardon);
  };

  function pardon(uuid) {
    if (serv.bannedPlayers[uuid]) {
      delete serv.bannedPlayers[uuid];
      return true;
    }
    return false;
  }

  serv.bannedPlayers = {};
};

module.exports.player=function(player,serv)
{
  player.kick = reason =>
  {
    player._client.write('kick_disconnect', {
      reason: reason ? JSON.stringify(reason) : '"You were kicked!"'
    });
  };

  player.ban = reason => {
    reason = reason || "You were banned!";
    player.kick(reason);
    var uuid=player._client.uuid;
    serv.ban(uuid, reason);
  };

  player.pardon = () => serv.pardon(player._client.uuid);
};