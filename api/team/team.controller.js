const teamService = require('./team.service')
const logger = require('../../services/logger.service')

async function getTeam(req, res) {
    const team = await teamService.getById(req.params.id)
    res.send(team)
}
  
async function getTeams(req, res) {
    console.log(req.query);
    const teams = await teamService.query(req.query)
    logger.debug(teams);
    res.send(teams)
}

async function deleteTeam(req, res) {
    await teamService.remove(req.params.id)
    res.end()
}

async function updateTeam(req, res) {
    const team = req.body;
    await teamService.update(team)
    res.send(team)
}


async function addTeam(req, res) {
    var team = req.body;
    // team.byUserId = req.session.user._id;
    team = await teamService.add(team)
    // team.byUser = req.session.user;
    // team.aboutUser = {}
    res.send(team)
}


module.exports = {
    getTeam,
    getTeams,
    deleteTeam,
    addTeam,
    updateTeam
}