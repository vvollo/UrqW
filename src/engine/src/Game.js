
import Quest from "./Quest";
import Player from "./Player";
import Client from "./Client";
import ModeUrqRip from "./modes/urqrip";
import ModeUrqDos from "./modes/urqdos";

/**
 * Игра (состояние)
 *
 * @constructor
 */
function Game(name) {
    /**
     * @type {boolean}
     */
    this.locked = false;

    /**
     * @type {Object}
     */
    this.items = {};

    /**
     * @type {Object}
     */
    this.vars = {
        'tokens_delim': '\ \,\"\?\!'
    };

    /**
     * @type {string} имя игры или файла для сохранения
     */
    this.name = name;

    /**
     * @type {Player} проигрыватель
     */
    this.Player = new Player(this);

    /**
     * @type {Quest} хранилище файла квеста
     */
    this.Quest = null;

    /**
     * @type {Client} Клиент
     */
    this.Client = new Client();

    /**
     * @type {number}
     */
    this.position = 0;

    /**
     * @type {string}
     */
    this.realCurrentLoc = '';

    /**
     * @type int режим
     */
    this.mode = 0;
}

/**
 *
 */
Game.prototype.init = function(msg) {
    this.Quest = new Quest(msg);
    this.Quest.init();

    this.realCurrentLoc = this.Quest.firstLabel;
    this.setVar('current_loc', this.Quest.firstLabel);
    this.setVar('previous_loc', this.Quest.firstLabel);

    this.mode = 'ripurq';
    if (this.mode) {
        if (this.mode == 'ripurq') {
            ModeUrqRip(Player);
        }
        if (this.mode == 'urqdos') {
            ModeUrqDos(Player);
        }
    }

    this.Player.Quest = this.Quest;
    this.Player.Client = this.Client;
    this.Client.Player = this.Player;

    this.Player.continue();
};

/**
 * @param name
 * @param {int} count
 */
Game.prototype.addItem = function(name, count) {
    return this.setItem(name, this.getItem(name) + parseInt(count));
};

/**
 * @param name
 * @param {int} count
 */
Game.prototype.removeItem = function(name, count) {
    return this.setItem(name, this.getItem(name) - parseInt(count));
};

/**
 *
 * @param name
 * @param {int} count
 */
Game.prototype.setItem = function (name, count) {
    if (this.locked) return false;

    count = parseInt(count);

    if (count <= 0) {
        delete this.items[name];
        this.setVar(name, 0);
    } else {
        this.items[name] = count;
        this.setVar(name, count);
    }
};

/**
 *
 * @param name
 * @return {int}
 */
Game.prototype.getItem = function (name) {
    return (this.items[name] == undefined) ? 0 : this.items[name];
};

/**
 * @param {String} variable
 * @param {*} value
 */
Game.prototype.setVar = function(variable, value) {
    if (variable.substr(0, 4).toLowerCase() == 'inv_') {
        variable = variable.substr(4);

        this.setItem(variable, value);
    } else {
        this.vars[variable.toLowerCase()] = value;
    }
};

/**
 * @param variable
 * @returns {*}
 */
Game.prototype.getVar = function(variable) {
    variable = variable.toLowerCase();

    if (variable.substr(0, 4) == 'inv_') {
        variable = variable.substr(4);
    }

    if (variable == 'rnd') {
        return Math.random();
    } else if (variable.substr(0, 3) == 'rnd') {
        return Math.floor(Math.random() * parseInt(variable.substr(3))) + 1;
    }

    if (variable == 'time') {
        var Datetime = new Date();
        return Datetime.getHours() * 3600 + Datetime.getMinutes() * 60 + Datetime.getSeconds();
    }

    // Для выражений вроде "1 деньги"
    if (variable.split(' ').length > 1) {
        var count = variable.split(' ')[0];
        if (!isNaN(count)) {
            variable = variable.split(' ').slice(1).join(' ').trim();
            return this.vars[variable] >= count;
        }
    }

    if (this.vars[variable] != undefined) {
        return this.vars[variable];
    }

    return 0;
};

/**
 * сохранение
 *
 * @param {int} slot
 */
Game.prototype.save = function(slot) {
    var Datetime = new Date();

    localStorage.setItem(this.name + '_' + slot.toString() + '_name', Datetime.toLocaleDateString() + ' ' + Datetime.toLocaleTimeString());
    localStorage.setItem(this.name + '_' + slot.toString() + '_data', JSON.stringify({
        status: this.Player.status,
        text: this.Player.text,
        buttons: this.Player.buttons,
        items: this.items,
        vars: this.vars,
        position: this.position,
        realCurrentLoc: this.realCurrentLoc
    }));
};

/**
 * загрузка
 *
 * @param {int} slot
 */
Game.prototype.load = function(slot) {
    var data = JSON.parse(localStorage.getItem(this.name + '_' + slot.toString() + '_data'));
    this.Player.status = data.status;
    this.Player.text = data.text;
    this.Player.buttons = data.buttons;
    this.items = data.items;
    this.vars = data.vars;
    this.position = data.position;
    this.realCurrentLoc = data.realCurrentLoc;
};

export default Game;
