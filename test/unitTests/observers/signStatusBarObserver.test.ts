import assert from 'assert';
import { SignStatusBarObserver } from '../../../src/observers/signStatusBarObserver';
import { StatusBarItem } from 'vscode';
import { CredentialInitializing, UserSignInSucceeded, CredentialReset, UserSignInTriggered } from '../../../src/common/loggingEvents';
import { getFakeEnvironmentController, setEnvToPPE, fakedCredential } from '../../utils/faker';
import { EnvironmentController } from '../../../src/common/environmentController';

describe('SignStatusBarObserver', () => {
    let showCalled: boolean;
    let environmentController: EnvironmentController;
    let observer: SignStatusBarObserver;

    let statusBarItem = <StatusBarItem>{
        show: () => { showCalled = true; }
    };

    before(() => {
        environmentController = getFakeEnvironmentController();
        observer = new SignStatusBarObserver(statusBarItem, environmentController);
    });

    beforeEach(() => {
        statusBarItem.text = undefined;
        statusBarItem.command = undefined;
        statusBarItem.tooltip = undefined;
        showCalled = false;
    });

    it(`Initialization: Status bar is shown with 'Initializing' text`, () => {
        let event = new CredentialInitializing();
        observer.eventHandler(event);
        assert.equal(showCalled, true);
        assert.equal(statusBarItem.text, `Docs: Initializing`);
        assert.equal(statusBarItem.command, undefined);
        assert.equal(statusBarItem.tooltip, undefined);
    });

    it(`User Signing in: Status bar is shown with 'Signing In' text`, () => {
        let event = new UserSignInTriggered('FakedCorrelationId');
        observer.eventHandler(event);
        assert.equal(showCalled, true);
        assert.equal(statusBarItem.text, `Docs: Signing in`);
        assert.equal(statusBarItem.command, undefined);
        assert.equal(statusBarItem.tooltip, undefined);
    });

    it(`User Signed In: Status bar is shown with user info`, () => {
        let event = new UserSignInSucceeded('FakedCorrelationId', fakedCredential);
        observer.eventHandler(event);
        assert.equal(showCalled, true);
        assert.equal(statusBarItem.text, `Docs: $(mark-github) Faked User(fake@microsoft.com)`);
        assert.equal(statusBarItem.command, 'docs.validationQuickPick');
        assert.equal(statusBarItem.tooltip, undefined);
    });

    it(`Reset User Info: Status bar is shown with 'Sign-in to Docs' text`, () => {
        let event = new CredentialReset();
        observer.eventHandler(event);
        assert.equal(showCalled, true);
        assert.equal(statusBarItem.text, `Docs: Sign in to Docs`);
        assert.equal(statusBarItem.command, 'docs.signIn');
        assert.equal(statusBarItem.tooltip, undefined);
    });

    it(`PPE Environment: Status bar is shown with 'Docs (PPE):'`, () => {
        // Mock PPE environment
        setEnvToPPE(environmentController);

        // Test
        let event = new CredentialInitializing();
        observer.eventHandler(event);
        assert.equal(showCalled, true);
        assert.equal(statusBarItem.text, `Docs (PPE): Initializing`);
        assert.equal(statusBarItem.command, undefined);
        assert.equal(statusBarItem.tooltip, undefined);
    });
});