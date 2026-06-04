"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiCreditCard, FiImage, FiPlusCircle, FiRefreshCw, FiUpload, FiX } from "react-icons/fi";
import { RiQrScan2Line } from "react-icons/ri";
import { ProductCard } from "@/components/cashier/product-card";
import { OrderPanel } from "@/components/cashier/order-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { money } from "@/lib/format";
import { Product } from "@/types/product";

const cats = ["Barchasi", "Paketlar", "Ichimliklar", "Snack", "Fast food", "Energy drink", "Merch", "Promo"];
const productCategories: Product["category"][] = ["Paketlar", "Ichimliklar", "Snack", "Fast food", "Energy drink", "Merch", "Promo"];
const paymentMethods = ["Naqd", "Karta", "QR", "Balans", "Aralash"];

function formatNumber(value: string) {
  return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function normalizeScanCode(value: string) {
  return value.replace(/[\r\n\t]/g, "").trim();
}

export function CashierTabs() {
  const { products, addProduct, addProductByQr, createProduct, updateProduct, deleteProduct, recordCashierTransaction, simulators, pay, addCashTransaction } = useDashboardStore();
  const [activeTab, setActiveTab] = useState("shop");
  const [category, setCategory] = useState("Barchasi");
  const [query, setQuery] = useState("");
  const [scanCode, setScanCode] = useState("");
  const [scannerMode, setScannerMode] = useState(true);
  const [scanMessage, setScanMessage] = useState("Scanner tayyor. QR kodni skan qiling yoki kodni kiriting.");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", qrCode: "", price: "", stock: "", category: "Ichimliklar" as Product["category"], icon: "PR", imageUrl: "" });
  const [balanceForm, setBalanceForm] = useState({ customer: "", phone: "", amount: "", method: "Karta" });
  const [returnForm, setReturnForm] = useState({ saleAmount: "", receivedAmount: "", method: "Naqd" });
  const [postPayForm, setPostPayForm] = useState({ simulatorId: "", amount: "", method: "Karta" });
  const [sessionPayForm, setSessionPayForm] = useState({ simulatorId: "", amount: "", method: "Karta" });
  const [txForm, setTxForm] = useState({ type: "income" as "income" | "expense", amount: "", source: "", method: "Naqd" });
  const [cashierMessage, setCashierMessage] = useState("");
  const qrInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef("");
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visible = products.filter((item) => {
    const matchesCategory = category === "Barchasi" || item.category === category;
    const text = `${item.name} ${item.qrCode} ${item.category}`.toLowerCase();
    return matchesCategory && text.includes(query.trim().toLowerCase());
  });
  const payableSimulators = simulators.filter((item) => ["busy", "unpaid", "reserved"].includes(item.status));
  const unpaidSimulators = payableSimulators.filter((item) => item.paymentStatus !== "paid" || item.status === "unpaid");
  const changeAmount = Math.max(Number(returnForm.receivedAmount || 0) - Number(returnForm.saleAmount || 0), 0);

  const scanProduct = useCallback((code = scanCode) => {
    const normalizedCode = normalizeScanCode(code);
    if (!normalizedCode) {
      qrInputRef.current?.focus();
      return;
    }

    const existingProduct = products.find((item) => item.qrCode.toLowerCase() === normalizedCode.toLowerCase() || item.id.toLowerCase() === normalizedCode.toLowerCase());
    if (existingProduct && existingProduct.stock <= 0) {
      setScanMessage(`${existingProduct.name} stock tugagan. QR: ${existingProduct.qrCode}`);
      setScanCode("");
      qrInputRef.current?.focus();
      return;
    }

    const product = addProductByQr(normalizedCode);
    if (product) {
      setScanMessage(`${product.name} orderga qo'shildi (${product.qrCode}).`);
      setScanCode("");
      qrInputRef.current?.focus();
      return;
    }
    setScanMessage(`QR topilmadi: ${normalizedCode}. Mahsulot ma'lumotlarini kiriting va saqlang.`);
    setScanCode(normalizedCode);
    setEditingProductId(null);
    setNewProduct((item) => ({ ...item, qrCode: normalizedCode, name: "", price: "", stock: "", icon: "PR" }));
    setProductModalOpen(true);
  }, [addProductByQr, products, scanCode]);

  useEffect(() => {
    if (activeTab === "shop" && !productModalOpen) qrInputRef.current?.focus();
  }, [activeTab, productModalOpen]);

  useEffect(() => {
    if (!scannerMode || productModalOpen || activeTab !== "shop") return;

    function resetBufferSoon() {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      scanTimerRef.current = setTimeout(() => {
        scanBufferRef.current = "";
      }, 600);
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTypingField = tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable;
      const isQrInput = target === qrInputRef.current;

      if (isTypingField && !isQrInput) return;

      if (event.key === "Enter" || event.key === "Tab") {
        const code = isQrInput ? (target as HTMLInputElement).value : scanBufferRef.current;
        if (code.trim()) {
          event.preventDefault();
          scanProduct(code);
          scanBufferRef.current = "";
        }
        return;
      }

      if (!isQrInput && event.key.length === 1) {
        scanBufferRef.current += event.key;
        resetBufferSoon();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, [activeTab, scanProduct, scannerMode, productModalOpen]);

  function resetProductForm() {
    setNewProduct({ name: "", qrCode: "", price: "", stock: "", category: "Ichimliklar", icon: "PR", imageUrl: "" });
    setEditingProductId(null);
    setProductModalOpen(false);
  }

  function startCreateProduct() {
    setEditingProductId(null);
    setNewProduct({ name: "", qrCode: "", price: "", stock: "", category: "Ichimliklar", icon: "PR", imageUrl: "" });
    setProductModalOpen(true);
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      qrCode: product.qrCode,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      icon: product.icon,
      imageUrl: product.imageUrl ?? "",
    });
    setProductModalOpen(true);
  }

  function submitProduct(event: React.FormEvent) {
    event.preventDefault();
    const price = Number(newProduct.price);
    const stock = Number(newProduct.stock);
    if (!newProduct.name.trim() || !newProduct.qrCode.trim() || !Number.isFinite(price) || !Number.isFinite(stock)) return;
    const payload = {
      name: newProduct.name.trim(),
      qrCode: newProduct.qrCode.trim(),
      price,
      stock,
      category: newProduct.category,
      icon: newProduct.icon.trim() || newProduct.name.slice(0, 2).toUpperCase(),
      imageUrl: newProduct.imageUrl.trim() || undefined,
    };

    if (editingProductId) {
      const updated = updateProduct(editingProductId, payload);
      if (updated) setScanMessage(`${updated.name} yangilandi. QR: ${updated.qrCode}`);
    } else {
      const created = createProduct(payload);
      setScanMessage(`${created.name} yaratildi. QR: ${created.qrCode}`);
    }
    resetProductForm();
  }

  function removeProduct(product: Product) {
    deleteProduct(product.id);
    setScanMessage(`${product.name} o'chirildi.`);
    if (editingProductId === product.id) resetProductForm();
  }

  function uploadProductImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setScanMessage("Faqat image fayl yuklash mumkin.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewProduct((item) => ({ ...item, imageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  }

  function submitBalance(event: React.FormEvent) {
    event.preventDefault();
    const amount = Number(balanceForm.amount);
    if (!balanceForm.customer.trim() || !Number.isFinite(amount) || amount <= 0) return;
    recordCashierTransaction(`balance top-up for ${balanceForm.customer.trim()}`, amount, balanceForm.method);
    setCashierMessage(`${balanceForm.customer.trim()} balansiga ${money(amount)} qo'shildi.`);
    setBalanceForm({ customer: "", phone: "", amount: "", method: "Karta" });
  }

  function submitReturn(event: React.FormEvent) {
    event.preventDefault();
    const saleAmount = Number(returnForm.saleAmount);
    const receivedAmount = Number(returnForm.receivedAmount);
    if (!Number.isFinite(saleAmount) || !Number.isFinite(receivedAmount) || saleAmount <= 0 || receivedAmount < saleAmount) return;
    setCashierMessage(`Qaytim: ${money(receivedAmount - saleAmount)}. Payment method: ${returnForm.method}.`);
    setReturnForm({ saleAmount: "", receivedAmount: "", method: "Naqd" });
  }

  function submitPostPay(event: React.FormEvent) {
    event.preventDefault();
    const amount = Number(postPayForm.amount);
    if (!postPayForm.simulatorId || !Number.isFinite(amount) || amount <= 0) return;
    pay(postPayForm.simulatorId, amount, postPayForm.method);
    const simulator = simulators.find((item) => item.id === postPayForm.simulatorId);
    setCashierMessage(`${simulator?.name ?? "Session"} post-payment: ${money(amount)} qabul qilindi.`);
    setPostPayForm({ simulatorId: "", amount: "", method: "Karta" });
  }

  function submitSessionPay(event: React.FormEvent) {
    event.preventDefault();
    const amount = Number(sessionPayForm.amount);
    if (!sessionPayForm.simulatorId || !Number.isFinite(amount) || amount <= 0) return;
    pay(sessionPayForm.simulatorId, amount, sessionPayForm.method);
    const simulator = simulators.find((item) => item.id === sessionPayForm.simulatorId);
    setCashierMessage(`${simulator?.name ?? "Session"} uchun ${money(amount)} to'lov qilindi.`);
    setSessionPayForm({ simulatorId: "", amount: "", method: "Karta" });
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full gap-1 rounded-xl p-1 sm:w-fit">
            <TabsTrigger className="h-9 px-3 text-sm" value="shop">Do'kon</TabsTrigger>
            <TabsTrigger className="h-9 px-3 text-sm" value="balance">Balans</TabsTrigger>
            <TabsTrigger className="h-9 px-3 text-sm" value="return">Qaytim</TabsTrigger>
            <TabsTrigger className="h-9 px-3 text-sm" value="post">Post-pay</TabsTrigger>
            <TabsTrigger className="h-9 px-3 text-sm" value="session">Sessiya</TabsTrigger>
            <TabsTrigger className="h-9 px-3 text-sm" value="tx">Prixod / Rasxod</TabsTrigger>
          </TabsList>
          <TabsContent value="shop">
            <Card className="mb-3 border-slate-800/80 bg-slate-950/40 p-3 shadow-none">
              <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative">
                  <RiQrScan2Line className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    ref={qrInputRef}
                    className="h-10 rounded-lg pl-9"
                    value={scanCode}
                    onChange={(event) => setScanCode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === "Tab") {
                        event.preventDefault();
                        scanProduct(event.currentTarget.value);
                      }
                    }}
                    placeholder="QR scanner input: masalan B2-QR-0001"
                    autoComplete="off"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <Button className="h-10 rounded-lg px-4" onClick={() => scanProduct()} disabled={!scanCode.trim()}><RiQrScan2Line /> Scan</Button>
                  <Button className="h-10 rounded-lg px-4" variant="secondary" onClick={startCreateProduct}><FiPlusCircle /> New product</Button>
                </div>
              </div>
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                <Button className="h-8 rounded-lg px-3 text-xs" size="sm" variant={scannerMode ? "success" : "secondary"} onClick={() => {
                  setScannerMode((value) => !value);
                  qrInputRef.current?.focus();
                }}>
                  <RiQrScan2Line /> Scanner mode {scannerMode ? "ON" : "OFF"}
                </Button>
                <span className="truncate text-xs text-slate-500">USB scanner: kod + Enter. Qo'lda ham QR kodni yozib Enter bosing.</span>
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-400">{scanMessage}</div>
            </Card>
            <div className="mb-3 flex items-center gap-2 overflow-auto rounded-xl border border-slate-800 bg-slate-950/50 p-1 thin-scrollbar">
              {cats.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${category === item ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}>{item}</button>)}
            </div>
            <Input className="mb-3 h-9 max-w-md rounded-lg" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product or QR..." />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((item) => <ProductCard key={item.id} product={item} onAdd={() => addProduct(item)} onEdit={() => startEditProduct(item)} onDelete={() => removeProduct(item)} />)}
            </div>
          </TabsContent>
          <TabsContent value="balance">
            <Card className="space-y-4 p-4">
              <div>
                <div className="text-xl font-black text-white">Balans to'ldirish</div>
                <div className="text-sm text-slate-400">Mijoz balansiga naqd, karta yoki QR orqali pul qo'shish.</div>
              </div>
              <form onSubmit={submitBalance} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2 xl:col-span-2"><Label>Mijoz</Label><Input value={balanceForm.customer} onChange={(event) => setBalanceForm((item) => ({ ...item, customer: event.target.value }))} placeholder="Mijoz ismi" /></div>
                <div className="space-y-2"><Label>Telefon</Label><Input value={balanceForm.phone} onChange={(event) => setBalanceForm((item) => ({ ...item, phone: event.target.value }))} placeholder="+998..." /></div>
                <div className="space-y-2"><Label>Payment</Label><Select value={balanceForm.method} onValueChange={(method) => setBalanceForm((item) => ({ ...item, method }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{paymentMethods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2 xl:col-span-2"><Label>Amount</Label><Input inputMode="numeric" value={formatNumber(balanceForm.amount)} onChange={(event) => setBalanceForm((item) => ({ ...item, amount: event.target.value.replace(/\D/g, "") }))} placeholder="50 000" /></div>
                <Button className="xl:col-span-2" type="submit" disabled={!balanceForm.customer.trim() || !balanceForm.amount}><FiCreditCard /> Balansga qo'shish</Button>
              </form>
              {cashierMessage ? <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-200">{cashierMessage}</div> : null}
            </Card>
          </TabsContent>

          <TabsContent value="return">
            <Card className="space-y-4 p-4">
              <div>
                <div className="text-xl font-black text-white">Qaytim</div>
                <div className="text-sm text-slate-400">Kassada mijoz bergan puldan qaytimni hisoblash.</div>
              </div>
              <form onSubmit={submitReturn} className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2"><Label>Savdo summasi</Label><Input inputMode="numeric" value={formatNumber(returnForm.saleAmount)} onChange={(event) => setReturnForm((item) => ({ ...item, saleAmount: event.target.value.replace(/\D/g, "") }))} placeholder="35 000" /></div>
                <div className="space-y-2"><Label>Berilgan pul</Label><Input inputMode="numeric" value={formatNumber(returnForm.receivedAmount)} onChange={(event) => setReturnForm((item) => ({ ...item, receivedAmount: event.target.value.replace(/\D/g, "") }))} placeholder="50 000" /></div>
                <div className="space-y-2"><Label>Payment</Label><Select value={returnForm.method} onValueChange={(method) => setReturnForm((item) => ({ ...item, method }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{paymentMethods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 md:col-span-2">
                  <div className="text-xs font-semibold uppercase text-slate-500">Qaytim</div>
                  <div className="mt-1 text-3xl font-black text-sky-200">{money(changeAmount)}</div>
                </div>
                <Button className="h-full min-h-16" type="submit" disabled={!returnForm.saleAmount || !returnForm.receivedAmount || Number(returnForm.receivedAmount) < Number(returnForm.saleAmount)}><FiRefreshCw /> Hisoblash</Button>
              </form>
              {cashierMessage ? <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-sm font-semibold text-sky-200">{cashierMessage}</div> : null}
            </Card>
          </TabsContent>

          <TabsContent value="post">
            <Card className="space-y-4 p-4">
              <div>
                <div className="text-xl font-black text-white">Post-payment</div>
                <div className="text-sm text-slate-400">Unpaid yoki partial sessiyalar uchun keyingi to'lovni qabul qilish.</div>
              </div>
              <form onSubmit={submitPostPay} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2 xl:col-span-2">
                  <Label>Session</Label>
                  <Select value={postPayForm.simulatorId} onValueChange={(simulatorId) => setPostPayForm((item) => ({ ...item, simulatorId }))}>
                    <SelectTrigger><SelectValue placeholder="Sessiya tanlang" /></SelectTrigger>
                    <SelectContent>{unpaidSimulators.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} - {item.currentUser ?? "Guest"} - {item.paymentStatus}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Amount</Label><Input inputMode="numeric" value={formatNumber(postPayForm.amount)} onChange={(event) => setPostPayForm((item) => ({ ...item, amount: event.target.value.replace(/\D/g, "") }))} placeholder="50 000" /></div>
                <div className="space-y-2"><Label>Payment</Label><Select value={postPayForm.method} onValueChange={(method) => setPostPayForm((item) => ({ ...item, method }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{paymentMethods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                <Button className="md:col-span-2 xl:col-span-4" type="submit" disabled={!postPayForm.simulatorId || !postPayForm.amount}><FiCheckCircle /> To'lovni qabul qilish</Button>
              </form>
              {cashierMessage ? <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-200">{cashierMessage}</div> : null}
            </Card>
          </TabsContent>

          <TabsContent value="session">
            <Card className="space-y-4 p-4">
              <div>
                <div className="text-xl font-black text-white">Sessiya to'lovi</div>
                <div className="text-sm text-slate-400">Aktiv yoki bron qilingan simulator sessiyasi uchun payment qabul qilish.</div>
              </div>
              <form onSubmit={submitSessionPay} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2 xl:col-span-2">
                  <Label>Simulator</Label>
                  <Select value={sessionPayForm.simulatorId} onValueChange={(simulatorId) => setSessionPayForm((item) => ({ ...item, simulatorId }))}>
                    <SelectTrigger><SelectValue placeholder="Simulator tanlang" /></SelectTrigger>
                    <SelectContent>{payableSimulators.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} - {item.currentUser ?? "Guest"} - {item.status}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Amount</Label><Input inputMode="numeric" value={formatNumber(sessionPayForm.amount)} onChange={(event) => setSessionPayForm((item) => ({ ...item, amount: event.target.value.replace(/\D/g, "") }))} placeholder="50 000" /></div>
                <div className="space-y-2"><Label>Payment</Label><Select value={sessionPayForm.method} onValueChange={(method) => setSessionPayForm((item) => ({ ...item, method }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{paymentMethods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                <Button className="md:col-span-2 xl:col-span-4" type="submit" disabled={!sessionPayForm.simulatorId || !sessionPayForm.amount}><FiCreditCard /> Sessiyani to'lash</Button>
              </form>
              {cashierMessage ? <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-200">{cashierMessage}</div> : null}
            </Card>
          </TabsContent>

          <TabsContent value="tx">
            <Card className="space-y-4 p-4">
              <div>
                <div className="text-xl font-black text-white">Prixod va Rasxod kiritish</div>
                <div className="text-sm text-slate-400">Kassaga kirim (prixod) yoki chiqim (rasxod) tranzaksiyalarini yozib borish.</div>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const amount = Number(txForm.amount);
                if (!txForm.source.trim() || !Number.isFinite(amount) || amount <= 0) return;
                addCashTransaction(txForm.type, amount, txForm.source.trim(), txForm.method);
                setCashierMessage(`${txForm.type === "income" ? "Kirim (Prixod)" : "Chiqim (Rasxod)"}: ${money(amount)} muvaffaqiyatli saqlandi.`);
                setTxForm({ type: "income", amount: "", source: "", method: "Naqd" });
              }} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label>Turi</Label>
                  <Select value={txForm.type} onValueChange={(v) => setTxForm((item) => ({ ...item, type: v as "income" | "expense" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Kirim (Prixod)</SelectItem>
                      <SelectItem value="expense">Chiqim (Rasxod)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To'lov turi</Label>
                  <Select value={txForm.method} onValueChange={(method) => setTxForm((item) => ({ ...item, method }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Summa</Label><Input inputMode="numeric" value={formatNumber(txForm.amount)} onChange={(e) => setTxForm((item) => ({ ...item, amount: e.target.value.replace(/\D/g, "") }))} placeholder="50 000" /></div>
                <div className="space-y-2 md:col-span-2 xl:col-span-4"><Label>Tavsif (Sabab)</Label><Input value={txForm.source} onChange={(e) => setTxForm((item) => ({ ...item, source: e.target.value }))} placeholder="Masalan: Kabel xaridi, turnir depoziti" /></div>
                <Button className="md:col-span-2 xl:col-span-4" type="submit" disabled={!txForm.source.trim() || !txForm.amount}><FiPlusCircle /> Saqlash</Button>
              </form>
              {cashierMessage ? <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-200">{cashierMessage}</div> : null}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <OrderPanel />
      <Dialog open={productModalOpen} onOpenChange={(open) => (open ? setProductModalOpen(true) : resetProductForm())}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingProductId ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}</DialogTitle>
            <DialogDescription>QR, narx, qoldiq, kategoriya va rasmni boshqaring.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitProduct} className="grid gap-4 md:grid-cols-[240px,1fr]">
            <div className="space-y-3">
              <Label>Rasm preview</Label>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                {newProduct.imageUrl.trim() ? (
                  <img src={newProduct.imageUrl} alt={newProduct.name || "Product preview"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-sky-200">
                    <FiImage className="text-5xl" />
                    <span className="text-xs font-semibold text-slate-500">Rasm tanlanmagan</span>
                  </div>
                )}
              </div>
              <input
                ref={imageInputRef}
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) => uploadProductImage(event.target.files?.[0])}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="secondary" onClick={() => imageInputRef.current?.click()}><FiUpload /> Upload</Button>
                <Button type="button" variant="outline" disabled={!newProduct.imageUrl} onClick={() => setNewProduct((item) => ({ ...item, imageUrl: "" }))}><FiX /> Remove</Button>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-400">
                Rasm product kartasida chiqadi. File upload yoki URL orqali qo'shish mumkin.
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label>Name</Label><Input value={newProduct.name} onChange={(event) => setNewProduct((item) => ({ ...item, name: event.target.value }))} placeholder="Product name" /></div>
              <div className="space-y-2"><Label>QR code</Label><Input value={newProduct.qrCode} onChange={(event) => setNewProduct((item) => ({ ...item, qrCode: event.target.value }))} placeholder="B2-QR-0010" /></div>
              <div className="space-y-2"><Label>Category</Label><Select value={newProduct.category} onValueChange={(value) => setNewProduct((item) => ({ ...item, category: value as Product["category"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{productCategories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Price</Label><Input inputMode="numeric" value={formatNumber(newProduct.price)} onChange={(event) => setNewProduct((item) => ({ ...item, price: event.target.value.replace(/\D/g, "") }))} placeholder="9 000" /></div>
              <div className="space-y-2"><Label>Stock</Label><Input inputMode="numeric" value={newProduct.stock} onChange={(event) => setNewProduct((item) => ({ ...item, stock: event.target.value.replace(/\D/g, "") }))} placeholder="72" /></div>
              <div className="space-y-2"><Label>Icon</Label><Input value={newProduct.icon} onChange={(event) => setNewProduct((item) => ({ ...item, icon: event.target.value }))} placeholder="PR" /></div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input value={newProduct.imageUrl.startsWith("data:") ? "Uploaded image selected" : newProduct.imageUrl} onChange={(event) => setNewProduct((item) => ({ ...item, imageUrl: event.target.value }))} placeholder="https://..." disabled={newProduct.imageUrl.startsWith("data:")} />
                  <Button type="button" variant="secondary" onClick={() => imageInputRef.current?.click()}><FiUpload /></Button>
                </div>
              </div>
              <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
                <Button type="button" variant="secondary" onClick={resetProductForm}><FiX /> Cancel</Button>
                <Button type="submit" disabled={!newProduct.name.trim() || !newProduct.qrCode.trim()}><FiPlusCircle /> {editingProductId ? "Save product" : "Create product"}</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
