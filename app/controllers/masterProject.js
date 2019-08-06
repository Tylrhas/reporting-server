const dates = require('./dates.controller')
module.exports = {
  getProjectData,
  computeData,
  computeandUpdate
}

async function computeandUpdate(locationInformation, sequelize) {
  try {
    const projectUpdate = await computeData(locationInformation)
    await sequelize.models.masterProject.upsert(projectUpdate)
    return
  } catch (error) {
    console.error(error)
  }
}

async function computeData(locationInformation) {
  let locations = await sequelize.models.lbs.findAll({
    where: {
      master_project_id: locationInformation.master_project_id
    }
  })
  const projectData = getProjectData(locations)
  projectData.id = locations[0].master_project_id
  return projectData
}

function getProjectData(locations) {
  let stages = []
  let stage = null
  let data = {
    pmId: null,
    totalMrr: 0,
    grossPs: 0,
    netPs: 0,
    totalPsDiscount: 0,
    grossCs: 0,
    netCs: 0,
    totalCsDiscount: 0,
    opportunityCloseDate: null,
    estimatedGoLive: null,
    actualGoLive: null,
    originalEstimatedGoLive: null,
    websiteLaunchDate: null,
    lostDate: null,
    stage: null,
    projectPhase: null,
    projectLostReason: null,
    onHoldDate: null,
  }
  for (let i = 0; i < locations.length; i++) {
    if (needsUpdate(data.estimatedGoLive, locations[i].dataValues.estimated_go_live)) {
      data.estimatedGoLive = dates.utc_to_pst_no_time(locations[i].dataValues.estimated_go_live)
    }
    console.log(locations[i].dataValues.original_estimated_go_live)
    if (needsUpdate(data.originalEstimatedGoLive, locations[i].dataValues.original_estimated_go_live)) {
      data.originalEstimatedGoLive = dates.utc_to_pst_no_time(locations[i].dataValues.original_estimated_go_live)
    }
    if (needsUpdate(data.actualGoLive, locations[i].dataValues.actual_go_live)) {
      data.actualGoLive = dates.utc_to_pst_no_time(locations[i].dataValues.actual_go_live)
    }
    if (needsUpdate(data.websiteLaunchDate, locations[i].dataValues.website_launch_date)) {
      data.websiteLaunchDate = dates.utc_to_pst_no_time(locations[i].dataValues.website_launch_date)
    }
    if (needsUpdate(data.lostDate, locations[i].dataValues.project_lost_date)) {
      data.lostDate = dates.utc_to_pst_no_time(locations[i].dataValues.project_lost_date)
    }
    if (needsUpdate(data.onHoldDate, locations[i].dataValues.on_hold_date)) {
      data.onHoldDate = dates.utc_to_pst_no_time(locations[i].dataValues.on_hold_date)
    }
    // calculate total discounts and MRR
    data.totalMrr += locations[i].dataValues.total_mrr
    data.grossPs += locations[i].dataValues.gross_ps
    data.netPs += locations[i].dataValues.net_ps
    data.totalPsDiscount += locations[i].dataValues.total_ps_discount
    data.grossCs += locations[i].dataValues.gross_cs
    data.netCs += locations[i].dataValues.net_cs
    data.totalCsDiscount += locations[i].dataValues.total_cs_discount

    stages.push(locations[i].dataValues.stage)
    data.pmId = locations[i].pm_id
  }
  console.log({ stages })
  // FIND THE GRATEST DATE FOR CEGL AND ACUTAL GO LIVE
  if (stages.indexOf('In Process') !== -1) {
    // a location is in process so set the project to in process
    stage = "In Process"
  } else if (stages.indexOf('On Hold') !== -1) {
    // there are on hold locations and no in process locations
    stage = "On Hold"
  } else if (stages.indexOf('Complete') !== -1 && stages.indexOf('On Hold') === -1) {
    // all locations are complete or lost so the project is complete
    stage = "Complete"
  } else if (stages.indexOf('Lost') !== -1 && stages.length === 1) {
    // all locations are Lost
    stage = "Lost"
  } else {
    throw new Error(`Error in finding the Stage of Master Project ID : ${locations[0].dataValues.master_project_id}`)
  }
  data.stage = stage
  if (data.stage !== 'Complete') {
    data.actualGoLive = null
    data.websiteLaunchDate = null
  }
  if (data.stage !== 'Lost') {
    data.websiteLaunchDate = null
  }
  if (data.stage !== 'On Hold') {
    data.onHoldDate = null
  }

  return data
}
function needsUpdate(currentDate, newDate) {
  if (newDate === null) {
    return false
  }
  if (currentDate == null) {
    return true
  }
  if (currentDate < dates.utc_to_pst_no_time(newDate)) {
    return true
  }
  return false
}