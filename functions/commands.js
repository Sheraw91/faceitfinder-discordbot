const { prefix } = require('../config.json')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')
const RegexFun = require('../functions/regex')
const Discord = require('discord.js')
const noMention = require('../templates/noMention')

const getCards = async (message, array, fn) => {
  return Promise.all(array.map(async obj => {
    if (obj.discord) {
      const user = await User.exists(obj.param)
      if (user) return fn(message, user.steamId).catch(err => noMention(errorCard(err)))
      else return errorCard('This user hasn\'t linked his profile')
    } else return fn(message, obj.param).catch(err => noMention(errorCard(err)))
  })).then(msgs => msgs.map(msg => {
    const data = {
      embeds: msg.embeds || [],
      files: msg.files || [],
      components: msg.components || []
    }

    if (msg.content) data.content = msg.content

    return data
  }))
}

const getCardsConditions = async (message, args, fn, maxUser = 10) => {
  if (args.length === 0)
    return await User.get(message.author.id) ?
      getCards(message, [{ param: message.author.id, discord: true }], fn) :
      errorCard(`You need to link your account to do that without a parameter, do \`${prefix}help link\` to see how.`)

  const steamIds = RegexFun.findSteamUIds(message.content)
    .slice(0, maxUser)
    .map(e => { return { param: e, discord: false } })

  if (steamIds.length > 0) return getCards(message, steamIds, fn)

  let params = []
  args.forEach(e => {
    const res = RegexFun.findUserMentions(e)
    params = params.concat(
      res.length > 0 ?
        res.map(r => {
          return {
            param: r,
            discord: true
          }
        })
        : { param: e.split('/').filter(e => e).pop(), discord: false }
    )
  })

  return getCards(message, params.slice(0, maxUser), fn)
}

const buildMessageFromInteraction = interaction => {
  const message = {
    author: interaction.user,
    mentions: {
      users: new Discord.Collection()
    },
    content: ''
  }
  const args = []
  interaction.options?._hoistedOptions?.filter(o => o.type === 'STRING').forEach(o => {
    o.value.split(' ').forEach(e => { if (e !== '') args.push(e) })
    message.content += o.value
  })

  return { message, args }
}

module.exports = {
  getCardsConditions,
  buildMessageFromInteraction
}