(() => {
  'use strict';
  const r = (r, e, o) => {
      globalThis.rdkitWorkerGlobals.jsMolCacheEnabled &&
        globalThis.rdkitWorkerGlobals.jsMolCache &&
        globalThis.rdkitWorkerGlobals.jsQMolCache &&
        ('mol' == o && (globalThis.rdkitWorkerGlobals.jsMolCache[r] = e),
        'qmol' == o && (globalThis.rdkitWorkerGlobals.jsQMolCache[r] = e));
    },
    e = (e, o, s) => {
      if (
        globalThis.rdkitWorkerGlobals.jsMolCacheEnabled &&
        (globalThis.rdkitWorkerGlobals.jsMolCache ||
          globalThis.rdkitWorkerGlobals.jsQMolCache)
      ) {
        if (
          (globalThis.rdkitWorkerGlobals.jsMolCache
            ? Object.keys(globalThis.rdkitWorkerGlobals.jsMolCache).length
            : 0) +
            (globalThis.rdkitWorkerGlobals.jsQMolCache
              ? Object.keys(globalThis.rdkitWorkerGlobals.jsQMolCache).length
              : 0) >
          globalThis.rdkitWorkerGlobals.maxJsMolsCached
        )
          return l(), void r(e, o, s);
        try {
          r(e, o, s);
        } catch (t) {
          console.error(t), l(), r(e, o, s);
        }
      }
    },
    o = (r, e) => {
      if (
        !globalThis.rdkitWorkerGlobals.jsMolCacheEnabled ||
        (!globalThis.rdkitWorkerGlobals.jsMolCache &&
          !globalThis.rdkitWorkerGlobals.jsQMolCache)
      )
        return null;
      if ('mol' == e)
        return globalThis.rdkitWorkerGlobals.jsMolCache
          ? globalThis.rdkitWorkerGlobals.jsMolCache[r]
          : null;
      if ('qmol' == e)
        return globalThis.rdkitWorkerGlobals.jsQMolCache
          ? globalThis.rdkitWorkerGlobals.jsQMolCache[r]
          : null;
      throw new Error(
        `@iktos-oss/rdkit-provider unkown molType=${e} passed to getJSMolFromCache`,
      );
    },
    l = () => {
      if (globalThis.rdkitWorkerGlobals?.jsMolCache)
        for (const [r, e] of Object.entries(
          globalThis.rdkitWorkerGlobals.jsMolCache,
        ))
          try {
            e.delete(), delete globalThis.rdkitWorkerGlobals.jsMolCache[r];
          } catch {}
      if (globalThis.rdkitWorkerGlobals?.jsQMolCache)
        for (const [r, e] of Object.entries(
          globalThis.rdkitWorkerGlobals.jsQMolCache,
        ))
          try {
            e.delete(), delete globalThis.rdkitWorkerGlobals.jsQMolCache[r];
          } catch {}
    },
    s = (r, l) => {
      const s = o(r, 'mol');
      if (s) return s;
      if (!r) return null;
      if (!l) return null;
      const t = { removeHs: globalThis.rdkitWorkerGlobals.removeHs },
        a = l.get_mol(r, JSON.stringify(t));
      return a
        ? (e(r, a, 'mol'), a)
        : (console.error(
            '@iktos-oss/rdkit-provider: failed to get mol for smiles = ',
            r,
          ),
          null);
    },
    t = (r, e) => {
      try {
        return s(r, e);
      } catch (o) {
        return console.error(o), l(), s(r, e);
      }
    },
    a = (r, l) => {
      const s = o(r, 'qmol');
      if (s) return s;
      if (!r) return null;
      if (!l) return null;
      const t = l.get_qmol(r);
      return t
        ? (e(r, t, 'qmol'), t)
        : (console.error(
            '@iktos-oss/rdkit-provider: failed to get qmol for structure =',
            r,
          ),
          null);
    },
    i = (r, e) => {
      try {
        return a(r, e);
      } catch (o) {
        return console.error(o), l(), a(r, e);
      }
    },
    n = (r) => {
      !globalThis.rdkitWorkerGlobals.jsMolCacheEnabled && r && r.delete();
    },
    c = ({ smiles: r, drawingDetails: e, alignmentDetails: o }) => {
      const l = t(r, globalThis.workerRDKit);
      if (!l) return null;
      if (o) {
        const r = t(o.molBlock, globalThis.workerRDKit);
        if (!r) return null;
        l.generate_aligned_coords(
          r,
          JSON.stringify({
            useCoordGen: globalThis.rdkitWorkerGlobals.preferCoordgen,
          }),
        ),
          n(r);
      }
      const s = e ? JSON.stringify(e) : '',
        a = l.get_svg_with_highlights(s);
      return o && l.set_new_coords(), n(l), a;
    },
    d = ({ smarts: r, width: e, height: o }) => {
      const l = i(r, globalThis.workerRDKit);
      if (!l) return null;
      const s = l.get_svg(e, o);
      return n(l), s;
    };
  function u({ smiles: r, returnFullDetails: e }) {
    const o = t(r, globalThis.workerRDKit);
    if (!o) return null;
    const l = JSON.parse(o.get_descriptors());
    return n(o), e ? l : { numAtoms: l.NumHeavyAtoms, numRings: l.NumRings };
  }
  const k = ({ structure: r, useQMol: e = !1 }) =>
      T({
        moleculeString: r,
        targetNotation: e ? 'smarts' : 'smiles',
        useQMol: e,
        sourceNotation: void 0,
      }),
    h = (r) => {
      if (!r) return !1;
      const e = t(r, globalThis.workerRDKit);
      if (!e) return !1;
      const o = e.is_valid();
      return n(e), o;
    },
    b = (r) => {
      if (!r) return !1;
      const e = i(r, globalThis.workerRDKit);
      if (!e) return !1;
      const o = e.is_valid();
      return n(e), o;
    },
    g = ({ smiles: r, substructure: e }) => {
      const o = t(r, globalThis.workerRDKit),
        l = i(e, globalThis.workerRDKit);
      if (!o || !l) return !1;
      const s = JSON.parse(o.get_substruct_match(l));
      return !!s && !!Object.keys(s).length;
    },
    m = (r) => {
      if (!r.includes('M  END')) return !1;
      const e = t(r, globalThis.workerRDKit);
      if (!e) return !1;
      try {
        return e.is_valid();
      } finally {
        n(e);
      }
    },
    T = ({
      moleculeString: r,
      targetNotation: e,
      sourceNotation: o,
      useQMol: l,
    }) => {
      if (((l = void 0 === l && 'smarts' === o), null != o)) {
        if (o === e)
          throw new Error(
            '@iktos-oss/rdkit-provider: source and target notations must differ',
          );
        if (!p(r, o))
          throw new Error(
            '@iktos-oss/rdkit-provider: molecule string not valid',
          );
      }
      const s = l ? i(r, globalThis.workerRDKit) : t(r, globalThis.workerRDKit);
      if (!s) return null;
      try {
        return s[`get_${e}`]();
      } catch (r) {
        throw (
          (console.error(r),
          new Error(
            '@iktos-oss/rdkit-provider: target notation not implemented',
          ))
        );
      } finally {
        n(s);
      }
    },
    _ = (r, e) => {
      const o = t(r, globalThis.workerRDKit);
      if (!o) return null;
      try {
        return void 0 !== e ? o.get_new_coords(e) : o.get_new_coords();
      } finally {
        n(o);
      }
    },
    f = (r) => {
      const e = t(r, globalThis.workerRDKit);
      if (!e) return null;
      try {
        const r = e.remove_hs();
        return _(r, !1);
      } finally {
        n(e);
      }
    },
    y = (r) => {
      const e = t(r, globalThis.workerRDKit);
      if (!e) return null;
      try {
        let r = e.add_hs();
        return (r = _(r, !1)), r;
      } finally {
        n(e);
      }
    },
    C = (r) => {
      const e = t(r, globalThis.workerRDKit);
      if (!e) throw new Error('@iktos-oss/rdkit-provider: mol is null');
      try {
        const r = e.get_stereo_tags(),
          { CIP_atoms: o, CIP_bonds: l } = JSON.parse(r);
        return { CIP_atoms: o, CIP_bonds: l };
      } catch (r) {
        throw (
          (console.error(r),
          new Error('@iktos-oss/rdkit-provider: could not get stereo tags'))
        );
      } finally {
        n(e);
      }
    },
    p = (r, e) => {
      switch (e) {
        case 'molblock':
          return m(r);
        case 'smiles':
        case 'smarts':
          return h(r);
        default:
          throw new Error(
            `@iktos-oss/rdkit-provider: validate ${e} not implemented`,
          );
      }
    };
  addEventListener('message', async ({ data: r }) => {
    let e;
    switch (r.actionType) {
      case 'INIT_RDKIT_MODULE':
        await (async ({
          rdkitPath: r,
          preferCoordgen: e,
          removeHs: o,
          cache: l = {},
        }) => {
          if (
            ((({ cache: r, preferCoordgen: e, removeHs: o }) => {
              const { enableJsMolCaching: l, maxJsMolsCached: s } = r;
              globalThis.rdkitWorkerGlobals = {
                jsMolCacheEnabled: !!l,
                jsMolCache: l ? {} : null,
                jsQMolCache: l ? {} : null,
                maxJsMolsCached: s ?? 150,
                preferCoordgen: e,
                removeHs: o,
              };
            })({ cache: l, preferCoordgen: e, removeHs: o }),
            globalThis.workerRDKit)
          )
            return;
          const s = new URL(r || '/RDKit_minimal.js', globalThis.origin);
          importScripts(s),
            globalThis.initRDKitModule &&
              ((globalThis.workerRDKit = await globalThis.initRDKitModule()),
              globalThis.workerRDKit.prefer_coordgen(e));
        })(r.payload);
        break;
      case 'GET_MOLECULE_DETAILS':
        e = u({ smiles: r.payload.smiles, returnFullDetails: !0 });
        break;
      case 'DEPRECATED_GET_MOLECULE_DETAILS':
        console.warn(
          '[DEPRECATED] Using deprecated molecule details retrieval. Please update to the full details API by passing returnFullDetails=true, careful numAtom is now NumHeavyAtom and not NumAtom.',
        ),
          (e = u({ smiles: r.payload.smiles, returnFullDetails: !1 }));
        break;
      case 'GET_CANONICAL_FORM_FOR_STRUCTURE':
        e = { canonicalForm: k(r.payload) };
        break;
      case 'IS_CHIRAL':
        e = ((r) => {
          const e = t(r, globalThis.workerRDKit);
          if (!e)
            throw new Error(
              '@iktos-oss/rdkit-provider: Failed to instanciate molecule',
            );
          try {
            return (
              e.get_smiles(JSON.stringify({ doIsomericSmiles: !1 })) !==
              e.get_smiles(JSON.stringify({ doIsomericSmiles: !0 }))
            );
          } finally {
            n(e);
          }
        })(r.payload.smiles);
        break;
      case 'GET_MORGAN_FP':
        e = (({ smiles: r, options: e }) => {
          const o = t(r, globalThis.workerRDKit);
          if (!o)
            throw new Error(
              '@iktos-oss/rdkit-provider: Failed to instanciate molecule',
            );
          try {
            return e ? o.get_morgan_fp(JSON.stringify(e)) : o.get_morgan_fp();
          } finally {
            n(o);
          }
        })(r.payload);
        break;
      case 'GET_SVG':
        e = { svg: c(r.payload) };
        break;
      case 'GET_SVG_FROM_SMARTS':
        e = { svg: d(r.payload) };
        break;
      case 'IS_VALID_SMILES':
        e = { isValid: h(r.payload.smiles) };
        break;
      case 'IS_VALID_SMARTS':
        e = { isValid: b(r.payload.smarts) };
        break;
      case 'HAS_MATCHING_SUBSTRUCTURE':
        e = { matching: g(r.payload) };
        break;
      case 'GET_SUBSTRUCTURE_MATCH':
        e = (({ structure: r, substructure: e }) => {
          const o = t(r, globalThis.workerRDKit),
            l = i(e, globalThis.workerRDKit);
          if (!o || !l) return null;
          const { atoms: s, bonds: a } = JSON.parse(o.get_substruct_match(l));
          return n(o), n(l), { matchingAtoms: s, matchingBonds: a };
        })(r.payload);
        break;
      case 'IS_VALID_MOLBLOCK':
        e = { isValid: m(r.payload.mdl) };
        break;
      case 'CONVERT_MOL_NOTATION':
        e = { structure: T(r.payload) };
        break;
      case 'ADD_HS':
        e = { mdl: y(r.payload.structure) };
        break;
      case 'REMOVE_HS':
        e = { mdl: f(r.payload.structure) };
        break;
      case 'GET_NEW_COORDS':
        e = { mdl: _(r.payload.structure, r.payload.useCoordGen) };
        break;
      case 'GET_STEREO_TAGS':
        e = { ...C(r.payload.structure) };
        break;
      case 'TERMINATE':
        l(), self.close();
        break;
      default:
        return;
    }
    var o;
    postMessage({
      actionType: ((o = r.actionType), o + '_LOCAL_RESPONSE'),
      payload: e,
      key: r.key,
    });
  });
})();
