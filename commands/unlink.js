const { color } = require('../config.json')
const Discord = require('discord.js')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')

const sendCardWithInfos = async (message) => {
  const discordId = message.author.id
  if (await User.exists(discordId)) {
    User.remove(discordId)

    return {
      embeds: [
        new Discord.MessageEmbed()
          .setColor(color.primary)
          .setDescription('Your account has been unlinked.')
      ]
    }
  }
  else return errorCard('Your account is not linked to a user.')
}

module.exports = {
  name: 'unlink',
  aliasses: ['unlink'],
  options: [],
  description: 'Unlink your steam id to the discord bot.',
  usage: '',
  type: 'utility',
  async execute(message, args) {
    return sendCardWithInfos(message)
  }
}