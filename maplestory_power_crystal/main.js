$(document).ready(function () {

    const MAX_POWER_CRYSTAL = 60

    const STR_DATE_DAY = "日"
    const STR_DATE_WEEK = "週"
    const STR_DATE_MONTH = "月"
    const INT_DATE_DAY = 0
    const INT_DATE_WEEK = 1
    const INT_DATE_MONTH = 2

    const STR_DIFFICULT_EASY = "EASY"
    const STR_DIFFICULT_NORMAL = "NORMAL"
    const STR_DIFFICULT_HARD = "HARD"
    const STR_DIFFICULT_CHAOS = "CHAOS"
    const INT_DIFFICULT_EASY = 0
    const INT_DIFFICULT_NORMAL = 1
    const INT_DIFFICULT_HARD = 2
    const INT_DIFFICULT_CHAOS = 3

    const app = {
        delimiters: ['${', '}'],
        data() {
            return {
                max_power_crystal: MAX_POWER_CRYSTAL,
                data: [],
                selected_boss: "",
                selected_difficult: "",
                selected_human: 1,
                select_boss: {},
                select_difficult: {},
                can_kill: [],
                ans_month_group: [],
                ans_week_group: [],
                ans_day_group: [],
                ans_bones_group: [],
                count_power_crystal: 0
            }
        },
        watch: {
            selected_boss(newValue, oldValue) {
                this.select_boss = this.data.filter(e => e.name == newValue)[0]
                this.selected_difficult = this.str_difficult(
                    this.getFilterDifficult()[0].difficult)
            },
            selected_difficult(newValue, oldValue) {
                var value = this.number_difficult(newValue)
                this.select_difficult = this.select_boss.data.filter(
                    e => e.difficult == value)[0]
            }

        },
        methods: {
            str_difficult(value) {
                switch (value) {
                    case INT_DIFFICULT_EASY:
                        return STR_DIFFICULT_EASY
                    case INT_DIFFICULT_NORMAL:
                        return STR_DIFFICULT_NORMAL
                    case INT_DIFFICULT_HARD:
                        return STR_DIFFICULT_HARD
                    case INT_DIFFICULT_CHAOS:
                        return STR_DIFFICULT_CHAOS
                }
                return "NULL"
            },
            number_difficult(value) {
                switch (value) {
                    case STR_DIFFICULT_EASY:
                        return INT_DIFFICULT_EASY
                    case STR_DIFFICULT_NORMAL:
                        return INT_DIFFICULT_NORMAL
                    case STR_DIFFICULT_HARD:
                        return INT_DIFFICULT_HARD
                    case STR_DIFFICULT_CHAOS:
                        return INT_DIFFICULT_CHAOS
                }
                return -1
            },
            str_limit(value) {
                switch (value) {
                    case INT_DATE_DAY:
                        return STR_DATE_DAY
                    case INT_DATE_WEEK:
                        return STR_DATE_WEEK
                    case INT_DATE_MONTH:
                        return STR_DATE_MONTH
                }
                return "NULL"
            },
            number_limit(value) {
                switch (value) {
                    case STR_DATE_DAY:
                        return INT_DATE_DAY
                    case STR_DATE_WEEK:
                        return INT_DATE_WEEK
                    case STR_DATE_MONTH:
                        return INT_DATE_MONTH
                }
                return -1
            },
            moneyFormat(value) {
                // 加上千分位符號
                return value
                    .toString()
                    .replace(/^(-?\d+?)((?:\d{3})+)(?=\.\d+$|$)/, (all, pre, groupOf3Digital) => {
                        return pre + groupOf3Digital.replace(/\d{3}/g, ',$&');
                    });
            },
            getBossData(boss, difficult) {
                var tmp_boss = this.data.filter(e => e.name == newValue)[0]
                var tmp_difficult = tmp_boss.data.filter(
                    e => e.difficult == this.number_difficult(difficult))[0]

                return {
                    'name': tmp_boss.name,
                    'difficult': tmp_difficult.difficult,
                    'limit': tmp_difficult.limit,
                    'times': tmp_difficult.times,
                    'money': tmp_difficult.money
                }

            },
            getFilterData() {
                return this.data.filter(e => {
                    var filter = this.can_kill.filter(i => i.name == e.name)
                    return e.data.length != this.can_kill.filter(i => i.name == e.name).length
                })
            },
            getFilterDifficult() {
                var response = []
                if (this.select_boss.data == undefined) {
                    response = []
                }
                else {
                    response = this.select_boss.data.filter(e => {
                        return this.can_kill.filter(i => this.select_boss.name == i.name && i.difficult == e.difficult).length == 0
                    })
                }
                return response
            },
            setDefaultValue() {
                if (this.getFilterData().length != 0) {
                    if (this.getFilterData().filter(e => e.name == this.selected_boss).length == 0) {
                        this.selected_boss = this.getFilterData()[0].name
                        this.select_boss = this.getFilterData()[0]
                    }
                }
                if (this.getFilterDifficult().length != 0) {
                    this.selected_difficult = this.str_difficult(
                        this.getFilterDifficult()[0].difficult)
                    this.select_difficult = this.getFilterDifficult()[0]
                }

            },
            importData(data) {
                var rowData = data.split(/\r\n|\n/);
                rowData.forEach(
                    element => {
                        var item = element.split(',')
                        if (item.length == 5) {
                            var diffcult_data = {
                                'difficult': Number(item[1]),
                                'limit': Number(item[2]),
                                'times': Number(item[3]),
                                'money': Number(item[4])
                            }

                            var tmp_data = this.data.filter(e => e.name == item[0])
                            if (tmp_data.length == 0) {
                                this.data.push({
                                    'name': item[0],
                                    'data': [diffcult_data]
                                })
                            }
                            else {
                                tmp_data[0].data.push(diffcult_data)
                            }
                        }
                    }
                )

                this.setDefaultValue()
            },
            optimization_list(data) {
                var response = []
                for (var i = 0; i < data.length; i++) {
                    const item = Object.assign({}, data[i]);
                    var response_index = response.findIndex(e => e.name == item.name)
                    if (response_index != -1) {
                        if (item.money > response[response_index].money) {
                            response.splice(response_index, 1, item);
                        }
                    }
                    else {
                        response.push(item)
                    }
                }
                return response
            },
            count_crystal(data) {
                var count = 0
                data.forEach(e => {
                    count += e.times
                })
                return count
            },
            updateAns() {
                var value = this.can_kill

                this.ans_month_group = []
                this.ans_week_group = []
                this.ans_day_group = []
                this.ans_bones_group = []
                this.count_power_crystal = 0

                // console.log(value)
                var limit_month_boss = this.optimization_list(
                    value.filter(e => e.limit == INT_DATE_MONTH))
                var limit_week_boss = this.optimization_list
                    (value.filter(e => e.limit == INT_DATE_WEEK))
                var limit_boss = this.optimization_list(
                    value.filter(e => e.limit == INT_DATE_DAY))


                if (limit_month_boss.length > 0) {
                    this.ans_month_group = limit_month_boss.sort((a, b) => {
                        var a_expected = (a.money / a.human) * a.times
                        var b_expected = (b.money / b.human) * b.times
                        return b_expected - a_expected
                    })
                }

                if (limit_week_boss.length > 0) {
                    this.ans_week_group = limit_week_boss.sort((a, b) => {
                        var a_expected = (a.money / a.human) * a.times
                        var b_expected = (b.money / b.human) * b.times
                        return b_expected - a_expected
                    })

                }

                if (limit_boss.length > 0) {
                    this.ans_day_group = limit_boss.sort((a, b) => {
                        var a_expected = (a.money / a.human) * a.times
                        var b_expected = (b.money / b.human) * b.times
                        return b_expected - a_expected
                    })
                }
                if (limit_week_boss.length > 0) {
                    this.ans_week_group = this.optimization_list(this.ans_week_group.concat(this.ans_day_group)).slice(0, this.max_power_crystal)
                }
                if (limit_month_boss.length > 0) {
                    this.ans_month_group = this.optimization_list(this.ans_month_group.concat(this.ans_week_group)).slice(0, this.max_power_crystal)
                }

                var day_boss = limit_week_boss.length > 0 ? 6 : 7
                var power_crystal = this.max_power_crystal - this.count_crystal(this.ans_week_group)
                while (this.count_crystal(this.ans_day_group) * day_boss > power_crystal) {
                    if (this.ans_day_group[this.ans_day_group.length - 1].times > 1) {
                        this.ans_day_group[this.ans_day_group.length - 1].times -= 1
                    }
                    else {
                        this.ans_bones_group.push(this.ans_day_group.pop())
                    }
                }
                power_crystal -= this.count_crystal(this.ans_day_group) * (day_boss - 1)
                this.ans_bones_group = this.ans_bones_group.concat(this.ans_day_group).sort((a, b) => {
                    var a_expected = (a.money / a.human) * a.times
                    var b_expected = (b.money / b.human) * b.times
                    return b_expected - a_expected
                })
                while (this.count_crystal(this.ans_bones_group) > power_crystal) {
                    if (this.ans_bones_group[this.ans_bones_group.length - 1].times > 1) {
                        this.ans_bones_group[this.ans_bones_group.length - 1].times -= 1
                    }
                    else {
                        this.ans_bones_group.pop()
                    }
                }
                power_crystal -= this.count_crystal(this.ans_bones_group)
                console.log(power_crystal)
                this.count_power_crystal = this.max_power_crystal - power_crystal

            },
            resetCanKill() {
                this.can_kill = []
                this.ans_month_group = []
                this.ans_week_group = []
                this.ans_day_group = []
                this.ans_bones_group = []
                this.count_power_crystal = 0
                this.setDefaultValue()
            },
            addCanKill() {
                const tmp_boss = this.select_boss
                const tmp_difficult = this.select_difficult
                this.can_kill.push(
                    {
                        'name': tmp_boss.name,
                        'difficult': tmp_difficult.difficult,
                        'limit': tmp_difficult.limit,
                        'times': tmp_difficult.times,
                        'money': tmp_difficult.money,
                        'human': this.selected_human
                    }
                )
                this.updateAns()
                this.setDefaultValue()
            },
            deleteCanKillIndex(index) {
                this.can_kill.splice(index, 1);
                this.updateAns()
                this.setDefaultValue()
            }
        },
        mounted() {

            $.ajax({
                type: "GET",
                url: "data.csv",
                dataType: "text",
                success: this.importData
            });
        }
    }

    Vue.createApp(app).mount('#app')

});