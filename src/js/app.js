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
                let masterClerk = '0x7cabe53f112edde5307837aca22beef50cfe9ee6';

                App.accounts = accounts;
                App.masterClerk = masterClerk;
                App.clerk = App.accounts[1];
                App.mechanic = App.accounts[2];
                App.citizen = App.accounts[3];
                App.insurer = App.accounts[4];
            });
        }).then(() => {
            App.bindEvents();
        }).then(() => {
            let gen = $('#generate');
            for (let i = 0; i < 18; i++) {
                gen.trigger('click');
            }
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

    bindEvents: function () {
        $('#contractAddressInput').on('input', App.handleContractAddressInput);
        $('#ConfirmPurchaseButton').on('click', App.handleConfirmPurchase);
        $('#ReadDataButton').on('click', App.handleReadData);

        $('body').on('click', '.vin-row', function () {
            $('.vin-row').removeClass('picked');
            $(this).addClass('picked');
            App.pickedVIN = web3.utils.asciiToHex($(this).text());
        });
        $('.datepickerr').datepicker({
            format: 'yyyy-mm-dd',
            autoclose: true
        });

        $('#ins-res-btn').on('click', function () {
            let op = $('.ins-res:checked').val();
            let actorAccount = App.getActor();
            if (op == 0) {
                App.contracts.VehicleInformation.methods.getLastInspectionResult(App.pickedVIN).call().then(res => {
                    console.log(res);
                });
            } else {
                let val = $('#ins-res-val').val() > 0;
                App.contracts.VehicleInformation.methods.setLastInspectionResult(App.pickedVIN, val).send({from: actorAccount});
            }
        });

        $('#ins-date-btn').on('click', function () {
            let op = $('.ins-date:checked').val();
            let actorAccount = App.getActor();
            if (op == 0) {
                App.contracts.VehicleInformation.methods.getLastInspectionTimestampUTC(App.pickedVIN).call().then(res => {
                    console.log(res);
                });
            } else {
                let date = $('#ins-date-val').val();
                let timestamp = Math.round(new Date(date).getTime() / 1000);
                App.contracts.VehicleInformation.methods.setLastInspectionTimestampUTC(App.pickedVIN, timestamp).send({from: actorAccount});
            }
        });


        $('#ins-exp-btn').on('click', function () {
            let op = $('.ins-exp:checked').val();
            let actorAccount = App.getActor();
            if (op == 0) {
                App.contracts.VehicleInformation.methods.getInsuranceExpiryTimestamp(App.pickedVIN).call().then(res => {
                    console.log(res);
                });
            } else {
                let date = $('#ins-exp-val').val();
                let timestamp = Math.round(new Date(date).getTime() / 1000);
                App.contracts.VehicleInformation.methods.setInsuranceExpiryTimestamp(App.pickedVIN, timestamp).send({from: actorAccount});
            }
        });

        $('#kilo-btn').on('click', function () {
            let op = $('.kilo:checked').val();
            let actorAccount = App.getActor();
            if (op == 0) {
                App.contracts.VehicleInformation.methods.getVehicleKilometrage(App.pickedVIN).call().then(res => {
                    console.log(res);
                });
            } else {
                let val = parseInt($('#kilo-val').val());
                App.contracts.VehicleInformation.methods.setVehicleKilometrage(App.pickedVIN, val).send({from: actorAccount});
            }
        });

        $('#veh-state-btn').on('click', function () {
            let op = $('.veh-state:checked').val();
            let actorAccount = App.getActor();
            if (op == 0) {
                App.contracts.VehicleInformation.methods.getVehicleState(App.pickedVIN).call().then(res => {
                    console.log(res);
                });
            } else {
                let val = parseInt($('#veh-state').val());
                App.contracts.VehicleInformation.methods.setVehicleState(App.pickedVIN, val).send({from: actorAccount});
            }
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
            if (childNodes.length > 18) {
                childNodes.last().remove();
            }
        });

        $('#execute').on('click', () => {
            let action = $('.sel-action:checked').val();
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
            if (action == 'revoke') {
                switch (role) {
                    case 'ins':
                        App.contracts.VehicleInformation.methods.revokeInsurerRole(target).send({from: App.masterClerk})
                            .then(() => {
                                console.log('insurer role revoked');
                            });
                        break;
                    case 'mech':
                        App.contracts.VehicleInformation.methods.revokeMechanicRole(target).send({from: App.masterClerk})
                            .then(() => {
                                console.log('mechanic role revoked');
                            });
                        break;
                    case 'clerk':
                        App.contracts.VehicleInformation.methods.revokeClerkRole(target).send({from: App.masterClerk})
                            .then(() => {
                                console.log('clerk role revoked');
                            });
                        break;
                    default:
                        break;
                }
            } else {
                switch (role) {
                    case 'ins':
                        App.contracts.VehicleInformation.methods.grantInsurerRole(target).send({from: App.masterClerk})
                            .then(() => {
                                console.log('insurer role granted');
                            });
                        break;
                    case 'mech':
                        App.contracts.VehicleInformation.methods.grantMechanicRole(target).send({from: App.masterClerk})
                            .then(() => {
                                console.log('mechanic role granted');
                            });
                        break;
                    case 'clerk':
                        App.contracts.VehicleInformation.methods.grantClerkRole(target).send({from: App.masterClerk})
                            .then(() => {
                                console.log('clerk role granted');
                            });
                        break;
                    default:
                        break;
                }
            }
        });
    }
};

$(function () {
    // $(window).load(function () {
    App.init();
    // });
});
