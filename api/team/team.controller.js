const teamService = require('./team.service')
const logger = require('../../services/logger.service')

async function getTeam(req, res) {
    const team = await teamService.getById(req.params.id)
    if (team) res.send(team)
    res.end()
}
  
async function getTeams(req, res) {
    console.log(req.query);
    const teams = await teamService.query(req.query)
    logger.debug(teams);
    res.send(teams)
}

async function deleteTeam(req, res) {
    await teamService.remove(req.params.id)
    res.send()
}

async function updateTeam(req, res) {
    const team = req.body;
    await teamService.update(team)
    res.send(team)
}


async function addTeam(req, res) {
    var team = req.body;
    // team.creatorId = req.session?.user?._id || null
    team.creatorId = req.session?.user?._id || 1
    team = await teamService.add(team)
    res.send(team)
}


module.exports = {
    getTeam,
    getTeams,
    deleteTeam,
    addTeam,
    updateTeam
}