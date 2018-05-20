App = {
    contracts: {},

    generateVIN: function () {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (let i = 0; i < 17; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);
        } else {
            web3 = new Web3('http://127.0.0.1:8545');
        }
        return App.initContract();
    },

    initContract: function () {
        $.getJSON('VehicleInformation.json', function (data) {
            let contract = new web3.eth.Contract(data.abi);
            contract.setProvider(web3.currentProvider);
            App.contracts.VehicleInformation = contract;
            App.contracts.VehicleInformation._address = '0x4fd86d51824e91ff32239c02cde8e7cc1ef4b218';
        }).then(() => {
            web3.eth.getAccounts().then(accounts => {
                App.accounts = accounts;
                App.masterClerk = App.accounts[0];
                App.clerk = App.accounts[1];
                App.mechanic = App.accounts[2];
                App.citizen = App.accounts[3];
                App.insurer = App.accounts[4];
            });
        }).then(() => {
            App.bindEvents();
        }).then(() => {
            let gen = $('#generate');
            for (let i = 0; i < 15; i++) {
                gen.trigger('click');
            }
        }).then(() => {
            App.displayResult('App ready', true);
        });
    },

    getActor: function () {
        let actor = $('.actor:checked').val();
        if (actor == 'mech') {
            return App.mechanic;
        }
        if (actor == 'clerk') {
            return App.clerk;
        }
        if (actor == 'ins') {
            return App.insurer;
        }
        if (actor == 'cit') {
            return App.citizen;
        }

        return null;
    },

    timestampToDate: function (timestamp) {
        if (timestamp == 0) {
            return 'empty';
        }
        var a = new Date(timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var time = date + ' ' + month + ' ' + year;
        return time;
    },

    intToState: function (int) {
        switch (int) {
            case 0:
                return 'Unknown';
            case 1:
                return 'Not Registered';
            case 2:
                return 'Registered';
            case 3:
                return 'Utilized';
            default:
                return 'Invalid';
        }
    },

    displayResult: function (msg, success) {
        let color = success ? 'green' : 'red';
        let node = '<span style="display:inline-block; color: ' + color + '; font-size: 24px; width: 100%;" id="result">' + msg + '</span>'
        $('#messages').prepend(node);
    },

    bindEvents: function () {
        $('body').on('click', '.vin-row', function () {
            $('.vin-row').removeClass('picked');
            $(this).addClass('picked');
            App.pickedVin = $(this).text();
            App.pickedVinBytes = web3.utils.asciiToHex(App.pickedVin);
        });

        $('.datepickerr').datepicker({
            format: 'yyyy-mm-dd',
            autoclose: true
        });

        $('#ins-res-set').on('click', function () {
            let actorAccount = App.getActor();
            let val = $('#ins-res-val').val() > 0;
            App.contracts.VehicleInformation.methods.setLastInspectionResult(App.pickedVinBytes, val).send({from: actorAccount}).then(() => {
                App.displayResult(App.pickedVin + ' last inspection result set to ' + val, true);
            }).catch(error => {
                App.displayResult('Failed to update inspection result for ' + App.pickedVin, false);
            });
        });
        $('#ins-res-get').on('click', function () {
            App.contracts.VehicleInformation.methods.getLastInspectionResult(App.pickedVinBytes).call().then(res => {
                App.displayResult(App.pickedVin + ' last inspection result is ' + res, true);
            });
        });

        $('#ins-date-set').on('click', function () {
            let actorAccount = App.getActor();
            let date = $('#ins-date-val').val();
            let timestamp = Math.round(new Date(date).getTime() / 1000);
            App.contracts.VehicleInformation.methods.setLastInspectionTimestampUTC(App.pickedVinBytes, timestamp).send({from: actorAccount}).then(() => {
                App.displayResult(App.pickedVin + ' last inspection date set to ' + App.timestampToDate(timestamp), true);
            }).catch(() => {
                App.displayResult('Failed to update inspection date for ' + App.pickedVin, false);
            });
        });
        $('#ins-date-get').on('click', function () {
            App.contracts.VehicleInformation.methods.getLastInspectionTimestampUTC(App.pickedVinBytes).call().then(res => {
                App.displayResult(App.pickedVin + ' last inspection date is ' + App.timestampToDate(res), true);
            });
        });

        $('#ins-exp-set').on('click', function () {
            let actorAccount = App.getActor();
            let date = $('#ins-exp-val').val();
            let timestamp = Math.round(new Date(date).getTime() / 1000);
            App.contracts.VehicleInformation.methods.setInsuranceExpiryTimestamp(App.pickedVinBytes, timestamp).send({from: actorAccount}).then(() => {
                App.displayResult(App.pickedVin + ' insurance expiration date set to ' + App.timestampToDate(timestamp), true);
            }).catch(() => {
                App.displayResult('Failed to update insurance expiration date for ' + App.pickedVin, false);
            });
        });

        $('#ins-exp-get').on('click', function () {
            App.contracts.VehicleInformation.methods.getInsuranceExpiryTimestamp(App.pickedVinBytes).call().then(res => {
                App.displayResult(App.pickedVin + ' insurance expiration date is ' + App.timestampToDate(res), true);
            });
        });

        $('#kilo-set').on('click', function () {
            let actorAccount = App.getActor();
            let val = parseInt($('#kilo-val').val());
            App.contracts.VehicleInformation.methods.setVehicleKilometrage(App.pickedVinBytes, val).send({from: actorAccount}).then(() => {
                App.displayResult(App.pickedVin + ' kilometrage set to ' + val, true);
            }).catch(() => {
                App.displayResult('Failed to update kilometrage for ' + App.pickedVin, false);
            });
        });
        $('#kilo-get').on('click', function () {
            App.contracts.VehicleInformation.methods.getVehicleKilometrage(App.pickedVinBytes).call().then(res => {
                App.displayResult(App.pickedVin + ' kilometrage is ' + res, true);
            });
        });

        $('#veh-state-set').on('click', function () {
            let actorAccount = App.getActor();
            let val = parseInt($('#veh-state').val());
            App.contracts.VehicleInformation.methods.setVehicleState(App.pickedVinBytes, val).send({from: actorAccount}).then(() => {
                App.displayResult(App.pickedVin + ' vehicle state set to ' + App.intToState(val), true);
            }).catch(() => {
                App.displayResult('Failed to update vehicle state for ' + App.pickedVin, false);
            });
        });

        $('#veh-state-get').on('click', function () {
            App.contracts.VehicleInformation.methods.getVehicleState(App.pickedVinBytes).call().then(res => {
                App.displayResult(App.pickedVin + ' vehicle state is ' + App.intToState(parseInt(res)), true);
            });
        });

        $('#generate').on('click', function () {
            let number = App.generateVIN();
            let list = $('#numbers');
            let node =
                '<div class="row vin-row pad">' +
                '<div class="col-xs-12">' + number + '</div>' +
                '</div>';
            list.prepend(node);

            let childNodes = list.children();
            if (childNodes.length > 15) {
                childNodes.last().remove();
            }
        });

        $('#revoke').on('click', () => {
            let role = $('#sel-role').val();
            let target = $('#sel-target').val();

            switch (target) {
                case 'ins':
                    target = App.insurer;
                    break;
                case 'mech':
                    target = App.mechanic;
                    break;
                case 'cit':
                    target = App.citizen;
                    break;
                case 'clerk':
                    target = App.clerk;
                    break;
                default:
                    break;
            }
            switch (role) {
                case 'ins':
                    App.contracts.VehicleInformation.methods.revokeInsurerRole(target).send({from: App.masterClerk})
                        .then(() => {
                            App.displayResult('Insurer role revoked', true);
                        });
                    break;
                case 'mech':
                    App.contracts.VehicleInformation.methods.revokeMechanicRole(target).send({from: App.masterClerk})
                        .then(() => {
                            App.displayResult('Mechanic role revoked', true);
                        });
                    break;
                case 'clerk':
                    App.contracts.VehicleInformation.methods.revokeClerkRole(target).send({from: App.masterClerk})
                        .then(() => {
                            App.displayResult('Clerk role revoked', true);
                        });
                    break;
                default:
                    break;
            }
        });

        $('#grant').on('click', () => {
            let role = $('#sel-role').val();
            let target = $('#sel-target').val();

            switch (target) {
                case 'ins':
                    target = App.insurer;
                    break;
                case 'mech':
                    target = App.mechanic;
                    break;
                case 'cit':
                    target = App.citizen;
                    break;
                case 'clerk':
                    target = App.clerk;
                    break;
                default:
                    break;
            }
            switch (role) {
                case 'ins':
                    App.contracts.VehicleInformation.methods.grantInsurerRole(target).send({from: App.masterClerk})
                        .then(() => {
                            App.displayResult('Insurer role granted', true);
                        });
                    break;
                case 'mech':
                    App.contracts.VehicleInformation.methods.grantMechanicRole(target).send({from: App.masterClerk})
                        .then(() => {
                            App.displayResult('Mechanic role granted', true);
                        });
                    break;
                case 'clerk':
                    App.contracts.VehicleInformation.methods.grantClerkRole(target).send({from: App.masterClerk})
                        .then(() => {
                            App.displayResult('Clerk role granted', true);
                        });
                    break;
                default:
                    break;
            }

        });
    }
};

$(function () {
    App.init();
});
