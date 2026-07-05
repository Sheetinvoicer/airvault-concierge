from transitions import Machine

class DelayClaimStateMachine:
    states = ['pending', 'processing', 'paid', 'failed', 'disputed']
    def __init__(self):
        self.machine = Machine(model=self, states=DelayClaimStateMachine.states, initial='pending')
        self.machine.add_transition('process', 'pending', 'processing')
        self.machine.add_transition('pay', 'processing', 'paid')
        self.machine.add_transition('fail', 'processing', 'failed')
        self.machine.add_transition('dispute', 'paid', 'disputed')
