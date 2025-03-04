const { emojis } = require('../../config.json')
const Discord = require('discord.js')
const Player = require('../../functions/player')
const loadingCard = require('../../templates/loadingCard')
const CustomType = require('../../templates/customType')
const DateStats = require('../../functions/dateStats')

const sendCardWithInfos = async (interaction, values, type = CustomType.TYPES.ELO) => {
  if (values.u !== interaction.user.id) return false
  const options = interaction.message.components.at(0).components
    .filter(e => e instanceof Discord.MessageSelectMenu)
    .map(msm => {
      return msm.options.map(o => {
        if (values.id !== 'uDSG') {
          const active = JSON.stringify(JSON.parse(o.value)) === JSON.stringify(values)
          o.emoji = active ? emojis.select.balise : null
          o.default = active
        } return o
      })
    }).at(0)

  const actionRow = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('dateStatsSelector')
        .addOptions(options))

  loadingCard(interaction)

  return DateStats.getCardWithInfos(actionRow, values, type)
}

module.exports = {
  name: 'dateStatsSelector',
  async execute(interaction) {
    return await sendCardWithInfos(interaction, JSON.parse(interaction.values.at(0)))
  },
  sendCardWithInfos
}