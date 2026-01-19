import React from "react";

interface Props {
  models: string[];
  onSelect: (model: string) => void;
}

const sortNewestFirst = (models: string[]) => {
  return [...models].sort((a, b) => {
    const parse = (s: string) => {
      const genMatch = s.match(/iPhone\s(\d+)/);
      const gen = genMatch ? parseInt(genMatch[1], 10) : 0;

      let tier = 3;
      if (/Pro Max/i.test(s)) tier = 1;
      else if (/Pro/i.test(s)) tier = 2;

      return { gen, tier };
    };

    const A = parse(a);
    const B = parse(b);

    if (A.gen !== B.gen) return B.gen - A.gen;
    return A.tier - B.tier;
  });
};

const ModelList: React.FC<Props> = ({ models, onSelect }) => {
  const orderedModels = sortNewestFirst(models);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mt-5">
      {orderedModels.map((m) => (
        <button
          key={m}
          onClick={() => onSelect(m)}
          className="
            bg-white border border-gray-300 text-black
            rounded-full px-6 py-3 text-base font-medium
            shadow-sm transition-all duration-300
            hover:shadow-lg hover:border-black
            hover:-translate-y-0.5
            cursor-pointer
          "
        >
          {m}
        </button>
      ))}
    </div>
  );
};

export default ModelList;
