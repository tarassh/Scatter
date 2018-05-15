import * as migrators from './versions/version';

const mathematicalVersion = version => {
    if(version === '0') return 0;
    const parts = version.replace(/[.]/g,'_').replace(/[m]/g, '').split('_');
    if(parts.length !== 3) throw new Error("Migration error, invalid version");
    const zeroed = (x,z) => { let s = x.toString(); while(s.length < z) s += '0'; return s; };
    return parseInt(parts.map((x,i) => i === 0 ? zeroed(x,4) : zeroed(x,2)).join(''));
};

const fnToVersion = fnName => fnName.replace(/[m]/g, '').replace(/[_]/g,'.');

export default scatter => {
    if(scatter.isEncrypted())           return false;
    if(!scatter.meta.needsUpdating())   return false;

    const lastVersion = mathematicalVersion(scatter.meta.lastVersion);
    const nextVersions = Object.keys(migrators).filter(v => mathematicalVersion(v) > lastVersion);
    if(nextVersions.length) {
        nextVersions.map(version => migrators[version](scatter));
        scatter.meta.lastVersion = fnToVersion(nextVersions[nextVersions.length-1]);
    }

    return nextVersions.length > 0;
}