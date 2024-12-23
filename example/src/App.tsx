import 'ketcher-react/dist/index.css';

import { useState, StrictMode } from 'react';
import { ButtonsConfig, Editor, InfoModal } from 'ketcher-react';
import {
  Ketcher,
  RemoteStructServiceProvider,
  StructServiceProvider,
  getStructure,
  SupportedFormat,
} from 'ketcher-core';
import { ModeControl } from './ModeControl';
import { useRDKitUtils } from '@iktos-oss/rdkit-provider';
import { MoleculeRepresentation } from '@iktos-oss/molecule-representation';

const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(window.location.search);
  const hiddenButtons = searchParams.get('hiddenControls');

  if (!hiddenButtons) return {};

  return hiddenButtons.split(',').reduce((acc, button) => {
    if (button) acc[button] = { hidden: true };

    return acc;
  }, {});
};

let structServiceProvider: StructServiceProvider =
  new RemoteStructServiceProvider(
    process.env.API_PATH || process.env.REACT_APP_API_PATH,
  );
if (process.env.MODE === 'standalone') {
  if (process.env.USE_SEPARATE_INDIGO_WASM === 'true') {
    // It is possible to use just 'ketcher-standalone' instead of ketcher-standalone/dist/binaryWasm
    // however, it will increase the size of the bundle more than two times because wasm will be
    // included in ketcher bundle as base64 string.
    // In case of usage ketcher-standalone/dist/binaryWasm additional build configuration required
    // to copy .wasm files in build folder. Please check /example/config/webpack.config.js.
    const {
      StandaloneStructServiceProvider,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('ketcher-standalone/dist/binaryWasm');
    structServiceProvider =
      new StandaloneStructServiceProvider() as StructServiceProvider;
  } else {
    const {
      StandaloneStructServiceProvider,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('ketcher-standalone');
    structServiceProvider =
      new StandaloneStructServiceProvider() as StructServiceProvider;
  }
}

const enablePolymerEditor = process.env.ENABLE_POLYMER_EDITOR === 'true';

type PolymerType = ({
  togglerComponent,
}: {
  togglerComponent?: JSX.Element;
}) => JSX.Element | null;

let PolymerEditor: PolymerType = () => null;
if (enablePolymerEditor) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Editor } = require('ketcher-macromolecules');
  PolymerEditor = Editor as PolymerType;
}

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);
  const { convertMolNotation } = useRDKitUtils();
  const [fullStruct, setFullStruct] = useState<string | null>(null);
  const [selectedStruct, setSelectedStruct] = useState<string | null>(null);
  const [highlightedAtoms, setHighlightedAtoms] = useState<number[] | null>(
    null,
  );

  const togglePolymerEditor = (toggleValue: boolean) => {
    setShowPolymerEditor(toggleValue);
    window.isPolymerEditorTurnedOn = toggleValue;
  };

  const togglerComponent = enablePolymerEditor ? (
    <ModeControl
      toggle={togglePolymerEditor}
      isPolymerEditor={showPolymerEditor}
    />
  ) : undefined;

  const convertToSmiles = async (ketcherStructure) => {
    const mol = await getStructure(
      SupportedFormat.mol,
      window.ketcher.formatterFactory,
      ketcherStructure,
    );

    const smiles = (
      await convertMolNotation({
        moleculeString: mol,
        sourceNotation: 'molblock',
        targetNotation: 'smiles',
      })
    )?.structure;

    return smiles;
  };

  const getAtomsToHighlight = (struct, selection) => {
    const atoms = [];
    const fullAtoms = Array.from(struct.atoms);
    console.log(fullAtoms);
    for (const atom of selection.atoms) {
      const index = fullAtoms.findIndex(
        (a) =>
          a[1].label === atom[1].label &&
          a[1].pp.x === atom[1].pp.x &&
          a[1].pp.y === atom[1].pp.y &&
          a[1].pp.z === atom[1].pp.z,
      );
      atoms.push(index);
    }

    return atoms;
  };

  const onGetStructure = async () => {
    const struct = await window.ketcher.editor.struct();
    const selection = await window.ketcher.editor.structSelected();

    let fullSmiles = await convertToSmiles(struct);
    let selectedSmiles = await convertToSmiles(selection);

    const highlights = getAtomsToHighlight(struct, selection);

    setHighlightedAtoms(highlights);
    setSelectedStruct(selectedSmiles);
    setFullStruct(fullSmiles);
  };

  return showPolymerEditor ? (
    <>
      <PolymerEditor togglerComponent={togglerComponent} />
    </>
  ) : (
    <StrictMode>
      <div
        style={{
          minHeight: '64px',
          border: '1px solid silver',
          marginBottom: '1rem',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <input
          type="text"
          disabled
          value="CC1=C(C(=CC=C1)C)NC(=O)CN2CCN(CC2)CC(COC3=CC=CC=C3OC)O"
        />
        <br />
        <button onClick={onGetStructure}>Get Structure and Selection</button>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
          }}
        >
          {fullStruct && (
            <div
              style={{
                border: '1px solid silver',
              }}
            >
              <pre>{fullStruct}</pre>

              <MoleculeRepresentation
                smiles={fullStruct}
                height={200}
                width={400}
                atomsToHighlight={
                  highlightedAtoms ? [highlightedAtoms] : undefined
                }
              />
            </div>
          )}
          {selectedStruct && (
            <div
              style={{
                border: '1px solid silver',
              }}
            >
              <pre>{selectedStruct}</pre>
              <MoleculeRepresentation
                smiles={selectedStruct}
                height={200}
                width={400}
              />
            </div>
          )}
        </div>
      </div>
      <Editor
        errorHandler={(message: string) => {
          setHasError(true);
          setErrorMessage(message.toString());
        }}
        buttons={hiddenButtonsConfig}
        staticResourcesUrl={process.env.PUBLIC_URL}
        structServiceProvider={structServiceProvider}
        onInit={(ketcher: Ketcher) => {
          window.ketcher = ketcher;

          window.parent.postMessage(
            {
              eventType: 'init',
            },
            '*',
          );
          window.scrollTo(0, 0);
        }}
        togglerComponent={togglerComponent}
      />
      {hasError && (
        <InfoModal
          message={errorMessage}
          close={() => {
            setHasError(false);

            // Focus on editor after modal is closed
            const cliparea: HTMLElement | null =
              document.querySelector('.cliparea');
            cliparea?.focus();
          }}
        />
      )}
    </StrictMode>
  );
};

export default App;
